var w = window.innerWidth - 1,
    h = window.innerHeight - 1,
    r = Math.min(w, h) / 2,
    color = d3.scale.category20c();
    bookmarks = null;

var vis = d3.select("#chart").append("svg")
              .attr("width", w)
              .attr("height", h)
            .append("g")
              .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

var partition = d3.layout.partition()
                  .sort(null)
                  .size([2 * Math.PI, r * r])
                  .value(function(d) { return (d.children ? d.children.size : 1); });

var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

d3.text("http://localhost:8080/data/bookmarks.html", "text/xml", function(text) {

	if( bookmarks == null ) { 
	  bookmarks = bmv.parser.generateTree(text);
	}
	
	var path = vis.data([bookmarks]).selectAll("path")
                .data(partition.nodes)
              .enter().append("path")
                .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
                .attr("d", arc)
                .style("stroke", "#fff")
                .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
                .attr("fill-rule", "evenodd");
 
  var text = vis.data([bookmarks]).selectAll("text")
                .data(partition.nodes)
              .enter().append("text")
                .attr("transform", function(d) { return "rotate(" + (d.x + d.dx / 2 - Math.PI / 2) / Math.PI * 180 + ")"; })
                .attr("x", function(d) { return Math.sqrt(d.y); })
                 .attr("dx", "0") // margin
                 .attr("dy", ".35em") // vertical-align
                 .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
                 .text(function(d) { return d.name; });
   
  var duration = d3.event && d3.event.altKey ? 5000 : 500;
  
  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", function(d) { toggle(d); update(d); });
  
  
});