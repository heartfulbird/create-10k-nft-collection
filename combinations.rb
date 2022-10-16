# If we have the SAME variations count in each category
# combinations = M in power of N
# where:
#   M is the Variations count
#   N is the Categories count

# EXAMPLE:
#   categories = {
#     bg: 2,
#     body: 2,
#     head: 2,
#     wear: 2,
#     glasses: 2
#   } => 32
#
#   variations = 2 (M)
#   categories = 5 (N)
#   so 2 in the power of 5 => 32

# Funky Brothers
#   ape 4
#   bg 14
#   glasses 2
#   hat 15
#   suit 13
# TOTAL: 21840
#
# categories = {
#   ape: 4,
#   bg: 14,
#   glasses: 2,
#   hat: 15,
#   suit: 13
# } # => 21840

# If we split collection in 2
# then CONS: we cant mix layers from first part wit hthe scrond part
# BUT PROS:
# we will not use any existing layer from part 1 so the nwe generation wil not affect rarity on a layer level
# All combination could be uniq anyway
# but with that approach we also DONT affect the initial rarity of any layer from the part 1

# categories = {
#   ape: 2,
#   bg: 7,
#   glasses: 1,
#   hat: 7,
#   suit: 6
# } # => 588 - no way, lets mix all layers


categories = {
  ape: 4,
  bg: 14,
  glasses: 3, # with "none"
  hat: 16, # with "none"
  suit: 13
} # = 34944 !!! (so get only 10 000 from them, it will bring more unique variations wiht more rare layers)


# TESTS:
# categories = {
#   ape: 4,
#   glasses: 2,
# } # 8

# categories = {
#   ape: 4,
#   glasses: 3, # with "none" to have no glasses variations
# } # => 12

$combinations = []
$combination = []
$combination_key = 0

def recursion(layer_index)
  # layers[i] # [1, 2, 3]

  layer = $layers[layer_index]
  return unless layer

  layer.each do |variation|
    $combination[layer_index] = variation


    # last layer
    if layer_index == $layers.count - 1
      $combinations << $combination.dup
      puts "new: #{$combination.inspect}"
    end

    recursion(layer_index + 1)
  end
end

$layers = categories.values.map {|i| (1..i).to_a }

recursion(0)

puts
puts 'Combinations:'
puts $combinations.inspect
puts
puts 'Combinations count:'
puts $combinations.count
