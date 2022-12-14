
Consider the recent renovation of Avery Hall. In this process several things had to be done.
- 
- I Remove Asbestos
- I Replace Windows
- I Paint Walls
- I Refinish Floors
- I Assign Offices
- I Move in Office-Furniture.

Clearly, some things had to be done before others could even begin—Asbestos had to be removed before anything; painting had to be done before the floors to avoid ruining them, etc. On the other hand, several things could have been done concurrently—painting could be done while replacing the windows and assigning office could have been done at anytime. Such a scenario can be nicely modeled using partial orderings.

### Partial Order Definition
A relation R on a set S is called a partial order if it is reflexive, antisymmetric and transitive. A set S together with a partial ordering R is called a partially ordered set or poset for short and is denoted
-   
-  -  -   (S, R)

Partial orderings are used to give an order to sets that may not have a natural one. In our renovation example, we could define an ordering such that (a, b) ∈ R if a must be done before b can be done.
We use the notation

a $\preccurlyeq$ b to indicate that (a, b) ∈ R is a partial order and
a $'\prec'$ b when a a $`\neq`$ b.

#### Comparability Definition

The elements a and b of a poset (S, 4) are called comparable if either a $\preccurlyeq$ b or b $\preccurlyeq$ a. When a, b ∈ S such that neither are comparable, we say that they are incomparable. Looking back at our renovation example, we can see that
- 
- Remove Asbestos ≺ a
for all activities ai. Also, Paint Walls ≺ Refinish Floors Some items are also incomparable—replacing windows can be done before, after or during the assignment of offices.

#### Total Orders Definition

If (S, $\preccurlyeq$ ) is a poset and every two elements of S are comparable, S is called a totally ordered set. The relation 4 is said to be a total order.

 ###### Example

- The set of integers over the relation “less than equal to” is a total order; (Z, $\preccurlyeq$ ) since for every a, b ∈ Z, it must be the case that
a $\preccurlyeq$ b or b $\preccurlyeq$ a.

What happens if we replace $\preccurlyeq$ with $\prec$ ?



### Hasse Diagrams

As with relations and functions, there is a convenient graphical representation for partial orders—Hasse Diagrams. Consider the digraph representation of a partial order—since we know we are dealing with a partial order, we implicitly know that the relation must be reflexive and transitive. Thus we can simplify the graph as follows:
- 
- I Remove all self-loops.
- I Remove all transitive edges.
- I Make the graph direction-less—that is, we can assume that the orientations are upwards.

The resulting diagram is far simpler.