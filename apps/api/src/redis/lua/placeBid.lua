-- placeBid.lua
-- KEYS[1]: auction:${auctionId}:current_bid
-- KEYS[2]: auction:${auctionId}:highest_bidder  
-- KEYS[3]: auction:${auctionId}:bid_count
-- ARGV[1]: userId
-- ARGV[2]: bid amount
-- ARGV[3]: timestamp

local currentBidKey = KEYS[1]
local highestBidderKey = KEYS[2]
local bidCountKey = KEYS[3]

local userId = ARGV[1]
local bidAmount = tonumber(ARGV[2])
local timestamp = ARGV[3]

-- Get current highest bid
local currentBid = redis.call('GET', currentBidKey)
if currentBid == false then
    currentBid = 0
else
    currentBid = tonumber(currentBid)
end

-- Check if new bid is higher
if bidAmount > currentBid then
    -- Update current bid and highest bidder
    redis.call('SET', currentBidKey, bidAmount)
    redis.call('SET', highestBidderKey, userId)
    redis.call('INCR', bidCountKey)
    
    -- Add to bid history (optional)
    local historyKey = 'auction:' .. string.match(currentBidKey, 'auction:([^:]+):') .. ':bid_history'
    redis.call('ZADD', historyKey, timestamp, userId .. ':' .. bidAmount)
    
    return 1  -- Success
else
    return 0  -- Bid too low
end