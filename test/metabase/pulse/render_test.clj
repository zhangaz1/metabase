(ns metabase.pulse.render-test
  (:require [metabase.pulse.render :as render]
            [metabase.models
             [card :refer [Card]]
             [collection :refer [Collection]]
             [permissions :as perms]
             [permissions-group :as group]
             [pulse :as pulse :refer [Pulse]]
             [pulse-card :refer [PulseCard]]
             [pulse-channel :refer [PulseChannel]]
             [pulse-channel-recipient :refer [PulseChannelRecipient]]
             [pulse-test :as pulse-test]]
            [expectations :refer [expect]]
            [toucan.util.test :as tt]
            [metabase.test.data :as data]))

(defn- x []
  (tt/with-temp* [Pulse     [{pulse-id :id}]
                  Card      [{card-id :id}]
                  PulseCard [pulse-card {:pulse_id pulse-id, :card_id card-id}]]
    (#'render/render-pulse-card
     :attachment
     (java.util.TimeZone/getTimeZone "UTC")
     pulse-card
     (data/run-mbql-query venues {:limit 2}))))
