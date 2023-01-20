# in console:
# require_relative './ruby/lottery_math.rb'

require 'json'
require 'pry'

# OpenSea:
# - Check you can create 5000 copies on OpenSea (quantity on Sell page)
# - Check you can buy ONLY 1 copy (old docs say for some coin that only ALL copies cna be bought at once)

class LotteryMath
  # Reveal (lottery) price
  # 10

  # Win min = (lottery price X times) MORE
  # So min Original price = (lottery price X 10) = 100

  # Original prices
  # 100
  # 1000
  # 10_000
  # 100_000
  # 1000_000

  # Proportion
  # 1 x 1
  # 1 x 10
  # 1 x 100
  # 1 x 1000
  # 1 x 10_000

  PROPORTION = [
    #       original + unrevealed)
    1,      # 1      + 1
    10,     # 5      + 5
    100,    # 50     + 50
    1000,   # 500    + 500
    10_000  # 4999   + 5000 => RESERVE 1 from original for first MOST RARE COPY to keep 11_111 in TOTAL
  ] # Total:  5555   + 5556 = 11_111

  # Titles:
  # Robot #1 (or Moonlight Power or Power Robot)
  # Robot #2
  # Robot #3
  # Robot #4
  # Robot #5
  ORIGINAL = {
    1 => 1,
    10 => 5,
    100 => 50,
    1000 => 500,
    10_000 => 4999
  } # Total: 5555

  # TODO: Title number starts from #5556
  # (the last original copy is 5555)
  # Robot #5556
  # Robot #5557
  # Robot #5558
  UNREVEALED = {
    1 => 1,
    10 => 5,
    100 => 50,
    1000 => 500,
    10_000 => 5000
  } # Total: 5556

  def initialize

  end

  def total
    # 11_111 => NICE!
    @total ||= PROPORTION.sum
  end

  # based on x/2 of all (by default)
  # BUT not less than 1
  #   so if the first = 1:
  #     reserve 1 from unrevealed
  #     OR from biggest part of original
  def original_total
    PROPORTION.sum do  |el|
      count = el/2.0
      count = 1 if count < 1.0
      count
    end
    # by default => 5556
    # so we reserved 1 from biggest category to keep 5555 originally
    # DOESNT MATTER AFTER REVEAL STARTED CAUSE IT WILL CHANGE NUMBERS on EACH REVEAL

    5555 # corrected
  end

  def unrevealed_total
    5556 # corrected
  end

  # We use "original total" as a base to start counting UNREVEALED
  def unrevealed_start_number
    original_total + 1
  end

  def pick
    category = PROPORTION.max_by { |weight| rand ** (1.0 / weight) }

    categories[category] ||= 0
    new_count = categories[category] + 1

    # TODO for MOST RARE => REVEAL MANUALLY
    # (anyway chances are that all super rares will be revealed NOT too early)
    max_reached_in_category = new_count > UNREVEALED[category]
    most_rare = (category == most_rare_category)

    # TODO: TO REVEAL MOST RARE:
    # - stop auto reveal script
    # - check manually if there are NFT's ready to REVEAL
    # - pick ONLY 1 id
    # - reveal JUST 1 MOST RARE NFT manually running the script with item ID
    # - start the auto script again or run standard versions manually

    # TODO: IT NEVER PICKS MOST RARE AUTOMATICALLY!
    if max_reached_in_category || most_rare
      category_found = false
      categories_without_most_rare.each do |new_category|
        categories[new_category] ||= 0
        new_count = categories[new_category] + 1

        if new_count <= UNREVEALED[new_category]
          category = new_category
          category_found = true
          break
        end
      end

      # if MOST RARE NOT REVEALED BUT WE ARE ON A LAST STEP
      unless category_found
        warning = 'CANT REVEAL MOST RARE NFT AS A LAST ITEM IN THE COLLECTION!'
        puts warning

        return nil
      end
    end

    categories[category] += 1
    save_categories

    category
  end

  def totals # imitation based on REAL fine-tunned algo
    unrevealed_total.times.each_with_object({}) do |_, obj|
      category = pick # REAL

      next unless category # can be nil because we skip auto assign of the MOST RARE as a LAST ITEM IN COLLECTION

      obj[category] ||= 0
      obj[category] += 1
    end.sort_by { |k, _v| k }.to_h
  end

  def totals_pretty
    pretty { totals }
  end

  def most_rare_category
    PROPORTION[0]
  end

  private

  def test_pick # random CATEGORY by probability
    PROPORTION.max_by { |weight| rand ** (1.0 / weight) }
  end

  def test_totals
    # here we generate UNREVEALED total times
    unrevealed_total.times.each_with_object({}) do |_, obj|
      # category = test_pick
      obj[category] ||= 0
      obj[category] += 1
    end.sort_by { |k, _v| k }.to_h
    # this can return
    # {
    #     "1": 2, !!!
    #     "10": 4,
    #     "100": 52,
    #     "1000": 499,
    #     "10000": 4999
    #   }
    # so it NEEDS correction

    # Correct algo this way:
    # - count how we add to category
    # - DONT allow to get (count > MAX) of that category
    # - IF we got (count > MAX) find category (starting from BIGGEST) where we still can add it
  end

  def test_pretty
    pretty { test_totals }
  end

  def pretty(h = nil)
    if block_given?
      puts JSON.pretty_generate(yield)
    else
      puts JSON.pretty_generate(h)
    end
  end

  def categories
    # persistent between runs (picks)
    # read & write to file in real world
    @categories ||= {}
  end

  def save_categories
    # save to file and read in categories
  end

  def categories_without_most_rare
    PROPORTION.sort.reverse.tap { |p| p.pop }
  end
end
