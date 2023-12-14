# 2023 Notes

[Return to root README.md](../README.md)

## Day 1

I started this one out with a simple regex that removed all non-digit characters.  This worked great for part 1.  For part 2, I
initially tried to just replace each number word with the actual number, but then I realized that they were combining some of the
words so that the last letter of one word was the first letter of the next word. I then just inserted the number in front of the word.
Later I realized I made another update where I replaced the word with the first letter, number, then last letter of the word.  
For example, one became o1e, two became t2o, etc.  This worked great.

I also made an Excel solution to this one, just to prove that it could be done.  Would not recommend.

## Day 2

This was a pretty simple one. For part 1, I simply had to make sure each game didn't have any more of the stones than were available.
For part 2, it was a simple matter of finding the highest number of stones used in any individual game for each color.  

## Day 3

For this one I built a grid that tracked where the numbers and symbols were located.  I then had a function that would check the position
of those numbers and symbols to find numbers adjacent to symbols.  For part 2, I just had to look at numbers adjacent to each '*' symbol 
and see if there were exactly 2.

## Day 4

For part 1, I just used the filter function to find any numbers that matched between the winning and played numbers.  I then just had to
get 2 to the power of the number of matches minus 1.  For part 2, I added an instance count.  I then iterated through each line to get the
number of instances, and then got a count of total final instances.

## Day 5

This was the first one that I had to do some optimization on.  I was able to get the first part to run quickly, but after spending
about 5 minutes waiting for the second part to finish, I decided to optimize it.  I tried to find the smallest slice of ranges that
would use all of the same maps and then skipped ahead to the next range.

## Day 6

Part 1 consisted of a loop that would start with 1, multiply that by the time minus the loop count until it was less than or equal
to the distance, I then got the second number by subtracting the first from the time and then got the difference in the two numbers.

For part 2, I simply removed the space between the numbers and ran the results through the same algorithm as part 1.  After Day 5,
I was worried this might take a while, but it was still pretty quick.

## Day 7

This was a fun one.  The initial part required identifying some simple poker-style patterns, sorting them, and getting a value based
on the bids.  For part 2, the Jacks became Jokers and were treated as wild.  The code was more or less the same, but included jokers.
The trickiest part involved making sure you didn't use a Joker more than once when identifying the best hand you could create.

## Day 8

This was the first day that really annoyed me.  After spending some time trying to figure out how to otimize the solution, I finally
looked up some tips.  I saw a lot of people talking about using LCM.  When looking at the data, I realized that each path was designed
to find an end node on a consistent repeating cycle.  Once I realized that, I just found that cycle for each path and used the lowest
common multiple.  However, this solution won't work for input that does not have this repeating cycle, and the puzzle description did
not say anything about it having that pattern.

## Day 9

This was a simple sequence matching problem.  Part 2 was a simple update to also check for the prior value.

## Day 10

This was another fun one.  It entailed tracking a pipe around it's loop.  For the first part, you just need to get the total length
of the loop and then divide it by 2.  For the second part, you had to calculate the inner area.  I used a method where I scanned each
line from left to right, tracking when a "wall" had been passed.  If you passed through an odd number of walls, you were inside the
loop, if you passed through an even number of walls, you were outside the loop.  I had to account for special cases where you crossed
the edge of a wall, but it wasn't terribly difficult to work out.

## Day 11

This one was another map.  You had to calculate the distance between galaxies.  Any empty rows or columns were areas that had a faster
expansion of the galaxy, so you needed to count them twice for the first part.  For part 2, they needed to be counted 100 times.  I
had setup the code in a way that it was pretty easy to scale up for the 2nd part.

## Day 12

I looked up some tips on part 2 of this one as well and saw people mentioning memoization.  I attempted to implement that into the
recursive version of my code, but it still ended up taking almost 3.5 hours to run.  I looked at some example code and re-arranged
it a bit and it now runs in about 138ms.

## Day 13

This one was pretty easy.  Initially it scared me a bit because the input looked a lot like the input for day 12. For Part 1, I
initially checked for matching lines that were sequential, and then checked each step out from there to make sure they were matching.
For checking on columns, I transposed the lines so I had each column as a single string as well, then just did the same check on those.
For part 2, I made separate functions to deal with the smudge and instead of looking for equality, I compared how many characters were
different between each line.  If there was 1 character difference, it was a potential smudge.  I made sure there were no more than 1
total smudges in a potential mirror.

## Day 14

Part 1 was fairly simple.  Simply break down the lines into a grid, then for tilting N move each O as far is it can go and add up the
loads.