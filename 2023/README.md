# 2023 Notes

[Return to root README.md](../README.md)

## Day 1

I started this one out with a simple regex that removed all non-digit characters.  This worked great for part 1.  For part 2, I initially tried to just replace each number word with the actual number, but then I realized that they were combining some of the words so that the last letter of one word was the first letter of the next word. I then just inserted the number in front of the word.  Later I realized I made another update where I replaced the word with the first letter, number, then last letter of the word.  For example, one became o1e, two became t2o, etc.  This worked great.

I also made an Excel solution to this one, just to prove that it could be done.  Would not recommend.

## Day 2

This was a pretty simple one. For part 1, I simply had to make sure each game didn't have any more of the stones than were available.  For part 2, it was a simple matter of finding the highest number of stones used in any individual game for each color.  

## Day 3

For this one I built a grid that tracked where the numbers and symbols were located.  I then had a function that would check the position of those numbers and symbols to find numbers adjacent to symbols.  For part 2, I just had to look at numbers adjacent to each '*' symbol and see if there were exactly 2.

## Day 4

For part 1, I just used the filter function to find any numbers that matched between the winning and played numbers.  I then just had to get 2 to the power of the number of matches minus 1.  For part 2, I added an instance count.  I then iterated through each line to get the number of instances, and then got a count of total final instances.

## Day 5

This was the first one that I had to do some optimization on.  I was able to get the first part to run quickly, but after spending about 5 minutes waiting for the second part to finish, I decided to optimize it.  I tried to find the smallest slice of ranges that would use all of the same maps and then skipped ahead to the next range.

## Day 6

Part 1 consisted of a loop that would start with 1, multiply that by the time minus the loop count until it was less than or equal to the distance, I then got the second number by subtracting the first from the time and then got the difference in the two numbers.
For part 2, I simply removed the space between the numbers and ran the results through the same algorithm as part 1.  After Day 5, I was worried this might take a while, but it was still pretty quick.

## Day 7

This was a fun one.  The initial part required identifying some simple poker-style patterns, sorting them, and getting a value based on the bids.  For part 2, the Jacks became Jokers and were treated as wild.  The code was more or less the same, but included jokers.  The trickiest part involved making sure you didn't use a Joker more than once when identifying the best hand you could create.

## Day 8

This was the first day that really annoyed me.  After spending some time trying to figure out how to otimize the solution, I finally looked up some tips.  I saw a lot of people talking about using LCM.  When looking at the data, I realized that each path was designed to find an end node on a consistent repeating cycle.  Once I realized that, I just found that cycle for each path and used the lowest common multiple.  However, this solution won't work for input that does not have this repeating cycle, and the puzzle description did not say anything about it having that pattern.

## Day 9

This was a simple sequence matching problem.  Part 2 was a simple update to also check for the prior value.

## Day 10

This was another fun one.  It entailed tracking a pipe around it's loop.  For the first part, you just need to get the total length of the loop and then divide it by 2.  For the second part, you had to calculate the inner area.  I used a method where I scanned each line from left to right, tracking when a "wall" had been passed.  If you passed through an odd number of walls, you were inside the loop, if you passed through an even number of walls, you were outside the loop.  I had to account for special cases where you crossed the edge of a wall, but it wasn't terribly difficult to work out.

## Day 11

This one was another map.  You had to calculate the distance between galaxies.  Any empty rows or columns were areas that had a faster expansion of the galaxy, so you needed to count them twice for the first part.  For part 2, they needed to be counted 100 times.  I had setup the code in a way that it was pretty easy to scale up for the 2nd part.

## Day 12

I looked up some tips on part 2 of this one as well and saw people mentioning memoization.  I attempted to implement that into the recursive version of my code, but it still ended up taking almost 3.5 hours to run.  I looked at some example code and re-arranged it a bit and it now runs in about 138ms.

## Day 13

This one was pretty easy.  Initially it scared me a bit because the input looked a lot like the input for day 12. For Part 1, I initially checked for matching lines that were sequential, and then checked each step out from there to make sure they were matching.  For checking on columns, I transposed the lines so I had each column as a single string as well, then just did the same check on those.  For part 2, I made separate functions to deal with the smudge and instead of looking for equality, I compared how many characters were different between each line.  If there was 1 character difference, it was a potential smudge.  I made sure there were no more than 1 total smudges in a potential mirror.

## Day 14

Part 1 was fairly simple.  Simply break down the lines into a grid, then for tilting N move each O as far is it can go and add up the loads.  
Part 2 was more complicated.  You need to do a 'spin cycle' 1000000000 times and then get the score.  My first thought was that at some point you are probably going to start going into a repeating pattern so I saved a snapshot of the platform after each cycle and then attempted to compare the current platform to one of the snapshots so I could get an idea of that cycle.  It never seemed to find a repeating pattern, though.  I spent way too much time trying to find another way to optimize it before looking up tips.  It seemed like other people hadd a cycle so I went back and looked at my snapshot code and eventually I realized that I had a bug in my code to compare the current state with the snapshot table. :)  Once I got that fixed, it worked great.

## Day 15

Part 1 was a simple adding the sum of the ASCII characters with a minor twist.  Nothing tricky about it at all.
Part 2 was a fairly simple processing of each of the original hashes to arrange them into a series of light boxes and then get the final power.

## Day 16

This was another fun path tracing pr blem.  For Part 1I started out with a recursive approach, but when I got to my full input, I blew up the call stack.  I modified it to use a stack approach instead and all was good.  I'm scared to see what Part 2 will bring.
Part 2 wasn't as bad as I was expecting.  I just had to shoot the light beam from every edge and find the greatest power.  It was a simple process of looping through the rows/cols and trying from every angle.  I was able to skip any of the inner columns to improve the performance a bit.

## Day 17

Day 17 broke me.  I've got an implementation that works for the test input, but doesn't work for my full input.  I've seen hints on using Dijkstra's algorithm or an A-star algorithm, but I think my brain is burned out and I'm not seeing an easy way to account for the going a maximum of 3 blocks in the same direction.  Will probably come back to this.  For now, I'm throwing in the towel.
Updates to this:  I tried implementing a Dijkstra's/A* algorithm, but I'm clearly not pruning the paths enough yet.  It's taking way too long.  Currently going on almost 19h and it hasn't finished.  I now know what I missed with my previous implementation, so I might try and include some ideas from that to speed it up.  My previous implementation, I worked backwards to build a cache, restricting the size of the area it checked to a square, walking back to the full square.  The reason that didn't provide the right value is that it is possible that to get the shortest path from somewhere in the middle, the path may need to leave that square.

## Day 18

I completed part 1 of this while waiting on Day 17 to finish.  This was similar to the day 10 part 2.  I just had to find a slightly different way to figure out when walls were crossed.
Umm... Part 2 is probably going to have to wait.  Checking in the horribly inefficient way of doing it for now, but even on the test input this would take forever to process using my original code.  I'm going to try and get caught up first and revisit this later.  Decided to add in some logging to get an idea how long it would take with the given setup.  Even just building out the initial map would take far too long and would likely end up blowing up my memory.
Part 2 update: I figured out how to do this more efficiently and it runs blazing fast.  The problem is, it gives me the right answer for the test data, but it is not correct for my own input!  This is going to be really tough to debug.  My basic strategy was to not try storing each block like I initially did.  Instead, it just stores each line segment.  To calculate the area, I slice everything horizontally to break things into squares.  I then just have to get the area of each square and add it up.  I also just noticed that I'm no longer getting the right answer to part 1.  That might make things a little easier to track down.  I'm dumping a couple of SVGs and a CSV file of debug data so I can visualize what is going on, and it looks like it is going to be a lot of work to figure out what is not being calculated quite right.  That will be a job for another day.  
Part 2 update 2:  As I was getting ready for bed, I had a though of what the issue might be.  I found a bug in my code that checked for overlap in two line segments.  Fixed that and I got the correct answer.  Yes!

## Day 19

Part 1 was setting up a series of workflows to process parts. It was pretty straightforward and I was glad for the break after struggling on the last couple of days. :)
Part 2 wasn't too bad.  It involved setting up a list of possible paths and what the min/max ranges were to get to the end of each path that had an accepted part.  It was then just simple math to calculate the total possible combinations for each path and add them all together.

## Day 20

Part 1 was a bit tricky to understand.  It appeared to be some sort of decision tree, but they way it was explained took a bit to understand all of the exact rules of how the pulses were supposed to be processed.  Once I got that figured out the implementation wasn't too bad.
Part 2 isn't too bad to change the code for using a brute-force method.  However, I'm guessing I will need to run over a trillion cycles, so that probably isn't very efficient.  I'll let it run a bit while I get an idea of how I can optimize this thing...  I may move on to day 21 in the meantime to try and get a bit more caught up.

## Day 21

Part 1 revisits a path finding algorithm.  I thought it was going to be simpler, but it took me a bit to finally get a solution that wasn't going to take days to complete.  I'm scared to look at what part 2 will bring....
Part 2 expands the map to a repeating, infinite size and changes the step count to 26,501,365.  I've implemented a brute fore method, but expect that would take weeks to complete.  I suspect the data is setup in a way that you reach the center of each map on the side all in the same number of steps, which means I can use that to calculate how many map sections it will complete to get closer to the final step count.  I'll probably move on for now and come back to this one later.
