// Elements JSON - https://js.cytoscape.org/#notation/elements-json
// JSON used to load elements into Cytoscape.js
// The elements JSON may be keyed by group such as nodes and edges.

var NodesEdges = {

    nodes: [
      { data: { id: '1', label: 'N1', type: 'NODE' } },
      { data: { id: '2', label: 'N2', type: 'NODE' } },
      { data: { id: '3', label: 'N3', type: 'NODE' } },
      { data: { id: '4', label: 'N4', type: 'NODE' } },
      { data: { id: '5', label: 'N5', type: 'NODE' } },
    ],
    edges: [
      {
        data: { source: '1', target: '2', label: '12' },
      },
      {
        data: { source: '1', target: '3', label: '13' },
      },
      {
        data: { source: '1', target: '4', label: '14' },
      },
      {
        data: { source: '1', target: '5', label: '15' },
      },
      {
        data: { source: '2', target: '3', label: '23' },
      },
      {
        data: { source: '2', target: '4', label: '24' },
      },
      {
        data: { source: '2', target: '5', label: '25' },
      },
      {
        data: { source: '3', target: '5', label: '35' },
      },
      {
        data: { source: '4', target: '5', label: '45' },
      },

    ]

};
