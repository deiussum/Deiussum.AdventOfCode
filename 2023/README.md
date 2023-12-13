# 2023 Notes

## Day 1

I started this one out with a simple regex that removed all non-digit characters.  This worked great for part 1.  For part 2, I 
initially tried to just replace each number word with the actual number, but then I realized that they were combining some of the
words so that the last letter of one word was the first letter of the next word. I then just inserted the number in front of the word.
Later I realized I made another update where I replaced the word with the first letter, number, then last letter of the word.  
For example, one became o1e, two became t2o, etc.  This worked great.

## Day 2

## Day 3

## Day 4

## Day 5

This was the first one that I had to do some optimization on.  I was able to get the first part to run quickly, but after spending
about 5 minutes waiting for the second part to finish, I decided to optimize it.  I tried to find the smallest slice of ranges that
would use all of the same maps and then skipped ahead to the next range.

## Day 6

## Day 7

## Day 8

This was the first day that really annoyed me.  After spending some time trying to figure out how to otimize the solution, I finally
looked up some tips.  I saw a lot of people talking about using LCM.  When looking at the data, I realized that each path was designed
to find an end node on a consistent repeating cycle.  Once I realized that, I just found that cycle for each path and used the lowest
common multiple.  However, this solution won't work for input that does not have this repeating cycle, and the puzzle description did
not say anything about it having that pattern.

## Day 9

## Day 10

## Day 11

## Day 12

I looked up some tips on part 2 of this one as well and saw people mentioning memoization.  I attempted to implement that into the 
recursive version of my code, but it still ended up taking almost 3.5 hours to run.  I looked at some example code and re-arranged
it a bit and it now runs in about 138ms.

## Day 13

This one was pretty easy.  Initially it scared me a bit because the input looked a lot like the input for day 12.
