var w = 960,
    h = 500,
    r = d3.scale.sqrt().domain([0, 20000]).range([0, 20]);

var force = d3.layout.force()
    .gravity(.01)
    .charge(-120)
    .linkDistance(60)
    .size([w, h]);

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

d3.xml("http://localhost:8080/data/bookmarks.html", "text/xml", function(xml) {
  var nodes = self.nodes = d3.select(xml).selectAll("DL"),
      links = self.links = nodes.slice(1).map(function(d) {
        return {source: d, target: d.parentNode};
      });
  
  force
      .nodes(nodes)
      .links(links)
      .start();
  
  var link = svg.selectAll("line.link")
      .data(links)
    .enter().append("svg:line")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
  
  var node = svg.selectAll("circle.node")
      .data(nodes)
    .enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return r(d.textContent) || 5; })
      .call(force.drag);
  
  force.on("tick", function() {
    nodes[0].x = w / 2;
    nodes[0].y = h / 2;

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});