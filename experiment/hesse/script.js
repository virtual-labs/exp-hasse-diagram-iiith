// JavaScript code goes here

// In JavaScript with strict mode, you can not, for example, use undeclared variables.
"use strict";

// Initialisation - https://js.cytoscape.org/#core/initialisation
//
// A graph can be created as follows:
//
// var cy = cytoscape({ /* options */ });

// If you want to use Cytoscape as a visualisation, then a container DOM element is required, e.g.:
//
// var cy = cytoscape({
//   container: document.getElementById('cy')
// });

// container : A HTML DOM element in which the graph should be rendered. The container is expected to be an empty div; the visualisation owns the div.
// elements : An array of elements specified as plain objects.

// Using an event listener will make sure that no graph-related code is run before the DOM has finished being laid out.
document.addEventListener("DOMContentLoaded", function () {

    var cy = cytoscape(
        {
            container: document.getElementById('cy'),
            boxSelectionEnabled: false,
            autounselectify: true,

            // Nodes and edges are in a separate file for easier creation with external programming language.
            elements: NodesEdges,

            layout: {
                //name: 'grid',
                //rows: 4
                name:'dagre'
            },

            // so we can see the ids

            style: [{
                selector: "node",
                css: {
                  content: "data(id)",
                  "text-valign": "center",
                  "text-halign": "center",
                  height: "30px",
                  width: "30px",
                  shape: "circle",
                  "background-color": "cyan"
                }
              },
              {
                selector: "edge",
                css: {
                  "curve-style": "bezier",
                  "control-point-step-size": 30,
                  "target-arrow-shape": "triangle"
                  //'line-color': 'red',
                  //"background-color": "red"
                }
              }
            ]
        }
    );

    //cy.elements('edge[label = "red"]').style('background-color', 'blue');
    //cy.edge('[label = "green"]').style('background-color', 'red');
    //cy.unbind('click');
    //cy.bind('click', 'edge', function(edge) {
      //console.log("click egde");
      //console.log(edge.target.predecessors().edges());
      //edge.target.predecessors().edges().animate({
        //style: {
          //lineColor: "red"
        //}
      //});

});
