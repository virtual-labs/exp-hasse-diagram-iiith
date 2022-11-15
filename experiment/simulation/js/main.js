//import cytoscape from "cytoscape";
//import dagre from "cytoscape-dagre";

//cytoscape.use(dagre);

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var relation = {
    nodes: [
        [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 6, 12],
        [1,2,3,4]
    ],
    edges: [
        [ [1, 1],[2, 2],[3, 3],[4, 4],[5, 5],[1, 2],[2, 3],[3, 4],[4, 5],[1, 3],[1, 4],[1, 5],[2, 4],[2, 5],[3, 4],[3, 5],[4, 5] ],
        [[1, 1],[2, 2],[3, 3],[4, 4],[6,6],[12,12],[1,2],[1,3],[1,4],[1,6],[1,12],[2,4],[2,6],[2,12],[3,6],[3,12],[4,12],[6,12]],
        [ [1,1],[2, 2],[3, 3],[4, 4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4] ]
    ],

    hasse: [
        ["1-2", "2-3", "3-4", "4-5"],
        ["1-2","1-3","2-4","2-6","3-6","4-12","6-12"],
        ["1-2", "2-3", "3-4"],

    ]
};


// number of examples
var i  = getRandomInt(relation.nodes.length)

//console.log(relation.nodes[i],relation.edges[i])
//console.log(relation.nodes[1],relation.edges[1])

//function to get hasse edges
function find_hasse_edges(i) {
    // TODO: add code to find edges in hasse diagram
    return   relation.hasse[i]; //["1-2", "2-3", "3-4", "4-5"];

}

var hasse_edges = find_hasse_edges(i);

// Create cytoscape nodes
var cy_nodes = relation.nodes[i].map((x) => {
    return { data: { id: `${x}` } };
});

var cy_edges = relation.edges[i].map((x) => {
    return {
        data: { id: `${x[0]}-${x[1]}`, source: `${x[0]}`, target: `${x[1]}` }
    };
});
//console.log(cy_edges)

var cy = (window.cy = cytoscape({
    container: document.getElementById("cy"),

    layout: {
        name: "dagre"
    },

    style: [
    {
        selector: "node",
        style: {
            content: "data(id)",
            "text-opacity": 0.5,
            "text-valign": "center",
            "text-halign": "right",
            "background-color": "#11479e"
        }
    },

    {
        selector: "edge",
        style: {
            "curve-style": "bezier",
            width: 5,
            "target-arrow-shape": "triangle",
            "line-color": "#9dbaea",
            "target-arrow-color": "#9dbaea"
        }
    },
    {
        selector: "edge.red",
        style: {
            "line-color": "red",
            "target-arrow-color": "red"
        }
    },
    {
        selector: "edge.green",
        style: {
            "line-color": "green",
            "target-arrow-color": "green"
        }
    }
    ],

    elements: {
        nodes: cy_nodes,
        edges: cy_edges
    }
}));

cy.center()

/* 
cy.on("click", "edge", function (evt) {
    console.log("clicked " + this.id());
    // console.log(e);
    if (hasse_edges.includes(this.id())) {
        this.addClass("green");
    } else {
    this.addClass("red");
    }
    // console.log(this.source().id());
    // console.log(evt);
}); */
console.log = (message,clr) => {
    // wait until the console is clear to show next message
    function setMessage (_message) {
      if ($('#console').text()) {
        // if console is not empty, check again in 0.5s
        window.setTimeout(() => { setMessage(_message) }, 500)
      } else {
        $('#console').text(_message,clr)
        window.setTimeout(() => {
          $('#console').text('')
        }, 1500) 
      }
    }
  
    setMessage(message)
  }
  
cy.on("tap", "edge", function (event) {
    //console.log("clicked " + this.id());
    //console.log(this.source().id(), this.target().id());
    //console.log(this.source.id==this.target.id );
    //console.log(hasse_edges,this.id)
    //console.log( this.source().id())
    if (hasse_edges.includes(this.id())) {
        this.addClass("green");
        //console.success('CORRECT\nedge is part of hasse diagram')
        console.log('CORRECT: edge is part of hasse diagram','color: green');
    } 

    else {
        this.addClass("red");
        //if ($(this).attr('source').id()==$(this).attr('target').id()){
        if (this.source().id()  == this.target().id() ){
            //alert("Reflexive / slef loop ");
            console.log('REFLEXIVE:\nthere exist a reflexive realtion','color: red');
            //console.log('there exist a reflexive realtion')
            //document.write("Reflexive");
            //document.getElementById("demo").innerHTML = 5 + 6;
        }
        else{
            console.log('TRANSITIVE:\nthere exist a transitive realtion',)
            //console.log('there exist a transitive realtion')
            //alert("Transitive");
        }  
    }
    //console.log(this.source().id());
    //console.log(evt);
    
});