(ns metabase.api.permission-graph
  "Convert the permission graph's naive json conversion into the correct types.

  The strategy here is to use s/conform to tag every value that needs to be converted with the conversion strategy,
  then postwalk to actually perform the conversion."
  (:require [clojure.spec.alpha :as s]
            [clojure.spec.gen.alpha :as gen]
            [clojure.walk :as walk]
            [clojure.core.match :as match]
            [metabase.mbql.util :as mbql.u]
            [medley.core :as m]))

(defmulti convert
  "convert values from the naively converted json to what we REALLY WANT"
  first)

(defmethod convert :kw->int
  [[_ k]]
  (Integer/parseInt (name k)))

(defmethod convert :str->kw
  [[_ s]]
  (keyword s))

(defmethod convert :kw->str
  [[_ s]]
  (name s))

(defmethod convert :nil->none
  [[_ _]]
  :none)

(defmethod convert :identity
  [[_ x]]
  x)

;;; --------------------------------------------------- Common ----------------------------------------------------

;; ids come in asa keywordized numbers
(s/def ::id (s/with-gen (s/or :kw->int (s/and keyword? #(re-find #"^\d+$" (name %))))
              #(gen/fmap (comp keyword str) (s/gen pos-int?))))

(s/def ::native (s/or :str->kw #{"write" "none"}
                      :nil->none nil?))

;;; --------------------------------------------------- Data Permissions ----------------------------------------------------

(s/def ::schema-name (s/or :kw->str keyword?))

;; {:groups {1 {:schemas {"PUBLIC" ::schema-perms-granular}}}} =>
;; {:groups {1 {:schemas {"PUBLIC" {1 :all}}}}}
(s/def ::read (s/or :str->kw #{"all" "none"}))
(s/def ::query (s/or :str->kw #{"all" "none" "segmented"}))

(s/def ::table-perms-granular (s/keys :opt-un [::read ::query]))

(s/def ::table-perms (s/or :str->kw #{"all" "segmented" "none"}
                           :identity ::table-perms-granular))

(s/def ::table-graph (s/map-of ::id ::table-perms
                               :conform-keys true))

(s/def ::schema-perms (s/or :str->kw #{"all" "segmented" "none"}
                            :identity ::table-graph))

;; {:groups {1 {:schemas {"PUBLIC" ::schema-perms}}}}
(s/def ::schema-graph (s/map-of ::schema-name ::schema-perms
                                :conform-keys true))

;; {:groups {1 {:schemas ::schemas}}}
(s/def ::schemas (s/or :str->kw   #{"all" "segmented" "none"}
                       :nil->none nil?
                       :identity  ::schema-graph))

(s/def ::db-perms (s/keys :opt-un [::native ::schemas]))

(s/def ::db-graph (s/map-of ::id ::db-perms
                            :conform-keys true))


(s/def :metabase.api.permission-graph.data/groups
  (s/map-of ::id ::db-graph
            :conform-keys true))

(s/def ::data-permissions-graph
  (s/keys :req-un [:metabase.api.permission-graph.data/groups]))


;;; --------------------------------------------------- Collection Permissions ----------------------------------------------------

(s/def ::collections
  (s/map-of (s/or :identity ::id
                  :str->kw  #{"root"})
            (s/or :str->kw #{"read" "write" "none"})))

(s/def ::collection-graph
  (s/map-of ::id ::collections))

(s/def :metabase.api.permission-graph.collection/groups
  (s/map-of ::id ::collection-graph
            :conform-keys true))

(s/def ::collection-permissions-graph
  (s/keys :req-un [:metabase.api.permission-graph.collection/groups]))

(defn converted-json->graph
  "The permissions graph is received as JSON. That JSON is naively converted. This performs a further conversion to
  convert graph keys and values to the types we want to work with."
  [spec kwj]
  (->> (s/conform spec kwj)
       (walk/postwalk (fn [x]
                        (if (and (vector? x) (get-method convert (first x)))
                          (convert x)
                          x)))))

(defn kwid?
  [k]
  (and (keyword? k) (re-find #"^\d+$" (name k))))

(defn kwstr?
  [k]
  (and (keyword? k) (re-find #"[a-z][A-Z]" (name k))))

(defn kwid->int
  [k]
  (-> k name Integer/parseInt))

(defn new-convert
  [g]
  (let [pairs (into [] g)]
    (reduce (fn [m pair]
              (merge m (first (mbql.u/match pair
                                [:groups group] [:groups (new-convert group)]
                                [kwid? map?]    [(kwid->int (first &match)) (new-convert (second &match))]
                                ))))
            {}
            pairs)))

{:groups {:1 {:schemas {:PUBLIC {:1 "all"}
                        :YES    {:1 "all"}}}}}


(defn convert-3
  [g]
  (walk/prewalk (fn [x]
                  (cond (kwid? x)                       (kwid->int x)
                        (:schemas x)                    (m/map-keys name (:schemas x))
                        (#{"all" "none" "segmented"} x) (keyword x)
                        :else                           x))
                g))
