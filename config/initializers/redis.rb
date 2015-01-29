# Be sure to restart your server when you modify this file.
uri = URI.parse(Configuration[:REDISTOGO_URL])
REDIS = Redis.new(:url => Configuration[:REDISTOGO_URL])