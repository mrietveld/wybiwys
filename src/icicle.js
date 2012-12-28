
var w = window.innerWidth - 100,
    h = 2500,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([0, h]),
    color = d3.scale.category20c(),
    root = null;

var vis = d3.select("#chart").append("svg")
              .attr("width", w)
              .attr("height", h);

var partition = d3.layout.partition()
                  .sort(null)
                  .value(function(d) { return (d.children ? d.children.length : 1); });

d3.text("http://localhost:8080/data/bookmarks.html", "text/xml", function(text) {
  
  if( root == null ) { 
    root = bmv.parser.generateTree(text);
  }
  
  update(root); 
});

function update(root) { 
  
  var g = vis.selectAll("g")
            .data(partition.nodes(root))
          .enter().append("svg:g")
            .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
            .on("click", click);

  var kx = w / root.dx,
      ky = h / 1;

  g.append("svg:rect")
      .attr("width", root.dy * kx)
      .attr("height", function(d) { return d.dx * ky; })
      .attr("class", function(d) { return d.children ? "parent" : "child"; });

  g.append("svg:text")
      .attr("transform", transform)
      .attr("dy", ".35em")
      .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
      .text(function(d) { return d.name; });

  d3.select(window)
      .on("click", function() { click(root); });

  function click(d) {
    if (!d.children) return;

    kx = (d.y ? w - 40 : w) / (1 - d.y);
    ky = h / d.dx;
    x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
    y.domain([d.x, d.x + d.dx]);

    var t = g.transition()
      .duration(d3.event.altKey ? 5000 : 500)
      .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

    t.select("rect")
      .attr("width", d.dy * kx)
      .attr("height", function(d) { return d.dx * ky; });

    t.select("text")
      .attr("transform", transform)
      .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });

    d3.event.stopPropagation();
  }

  function transform(d) {
    return "translate(8," + d.dx * ky / 2 + ")";
  }
}
