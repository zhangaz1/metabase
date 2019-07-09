(ns metabase.query-processor-test.basic-test
  "Tests for simple queries."
  (:require [metabase.models.field :refer [Field]]
            [metabase.query-processor-test :as qp.test]
            [metabase.test
             [data :as data]
             [util :as tu]]))

;; do `:settings` come back with normal queries?
(qp.test/expect-with-non-timeseries-dbs
  [(assoc (qp.test/col :venues :price)
     :settings {:is_priceless false})]
  (tu/with-temp-vals-in-db Field (data/id :venues :price) {:settings {:is_priceless false}}
    (qp.test/cols
      (data/run-mbql-query venues
        {:fields [$price], :limit 1}))))
