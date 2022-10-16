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
#   }
#   variations = 2 (M)
#   categories = 5 (N)
#   # => 2 in the power of 5 = 32

# Funky Brothers
#   ape 4
#   bg 14
#   glasses 2
#   hat 15
#   suit 13
# TOTAL: 21840
# categories = {
#   ape: 4,
#   bg: 14,
#   glasses: 2,
#   hat: 15,
#   suit: 13
# } # 21840


# TESTS:
categories = {
  ape: 4,
  glasses: 2,
} # 8

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
