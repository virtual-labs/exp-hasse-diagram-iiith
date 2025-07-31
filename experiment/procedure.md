# Procedure

This experiment allows you to practice constructing Hasse diagrams by clicking on vertices to create covering relations (direct edges) for given partial orders.

## Interactive Hasse Diagram Construction

**Objective:** Build the correct Hasse diagram by adding edges one at a time between the given vertices.

**How to Use:**

1. **Adding Edges:** Click on two vertices in sequence to create a directed edge representing a covering relation in the Hasse diagram.
   - First click selects the source vertex
   - Second click selects the target vertex and creates the edge
   - The edge represents a covering relation from the first vertex to the second

2. **Checking Your Work:**
   - Click the **"Check Diagram"** button to verify if your constructed Hasse diagram is correct
   - The system will provide feedback indicating whether your diagram matches the expected solution
   - Correct edges will be highlighted, and missing or incorrect edges will be indicated

3. **Getting Help:**
   - Click the **"Hint"** button to get guidance on the next edge to add
   - Hints will help you understand the structure of the partial order

4. **Managing Your Progress:**
   - Use **"Undo"** to remove the last edge you added
   - Use **"Clear Diagram"** to remove all edges and start over
   - Use **"New Relation"** to generate a completely new partial order to practice with

5. **Adjusting Parameters:**
   - Click the floating controls button (⚙️) to access parameter settings
   - Change the number of nodes (4-8) to adjust difficulty
   - Select different relation types:
     - **Easy Mode:** Subsets of {1,2,3} - simpler relationships
     - **Hard Mode:** Subsets of {1,2,3,4} - more complex relationships
     - **Divisors Mode:** Divisibility relations between numbers

6. **Understanding the Display:**
   - The Poset Properties panel shows information about your current diagram
   - Minimal and maximal elements are identified
   - Total number of relations is tracked

**Tips for Success:**

- Remember that Hasse diagrams show only covering relations (direct connections)
- Look for minimal elements (no elements below them) and maximal elements (no elements above them)
- Don't add transitive edges - only direct covering relations
- Use the hint system if you get stuck
