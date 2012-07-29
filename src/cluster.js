var height = 5000; 

function width() { 
  return window.innerWidth;
}
 
var tree = d3.layout.cluster()
    .size([height, width()-750]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("#chart").append("svg")
              .attr("width", width())
              .attr("height", height)
            .append("g")
              .attr("transform", "translate(40, 0)");

d3.text("http://localhost:8080/data/bookmarks.html", "text/xml", function(text) {
  
  var bookmarkRoot = generateBookmarkTree(text);
  console.log("!!! DONE !!!");
  
  var nodes = tree.nodes(bookmarkRoot);
  var link = vis.selectAll("path.link")
               .data(tree.links(nodes))
             .enter().append("path")
               .attr("class", "link")
               .attr("d", diagonal);
  
  var node = vis.selectAll("g.node")
               .data(nodes)
             .enter().append("g")
               .attr("class", "node")
               .attr("transform", function(d) { 
                 return "translate(" + d.y + "," + d.x + ")"; }
               );
  
  node.append("circle").attr("r", 4.5);
  
  node.append("text")
      .attr("dx", function(d) { return d.children ? -8 : 8; })
      .attr("dy", 3)
      .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.name; });
  
});

function generateBookmarkTree(text) { 
  
  /**
   * Take as input: 
   * - text: string: searches starting for next element starting at position _1_ (not 0). 
   * - from: int: where the search should start
   * 
   * Returns a next object with the following fields: 
   * - min: location of closest element
   * - folder: location of closest folder (group)
   * - close: location of closest folder group close
   * - mark: location of closest bookmark
   * - descr: location of closest bookmark description
   */
  function findNextElement(text, from) { 
    var next = { min : Infinity,
                 folder : Infinity, 
                 close : Infinity,
                 mark : Infinity,
                 descr : Infinity
       };
    if( from > text.length ) { 
      return next; 
    }
    if( from == undefined ) {
      from = 0;
    }
    var pos = from;
    do {
      pos = text.indexOf("<", pos+1);
      
      if( text.charAt(pos+1) == 'D' ) { 
        switch( text.charAt(pos+2) ) { 
        // <DT><H - folder
        // <DT><A - bookmark
        case 'T':
          if( text.charAt(pos+3) == '>' 
              && text.charAt(pos+4) == '<' ) { 
            if( text.charAt(pos+5) == 'H' ) { 
              next.min = pos;
              next.folder = next.min;
            } else if( text.charAt(pos+5) == 'A' ) {  
              next.min = pos;
              next.mark = next.min;
            }
          }
          break;
        // <DD> - bookmark description
        case 'D': 
          if( text.charAt(pos+3) == '>' ) { 
            next.min = pos;
            next.descr = next.min;
          }
          break;
        }
      } else if( text.charAt(pos+1) == '/' 
                 && text.charAt(pos+2) == 'D'
                 && text.charAt(pos+3) == 'L'
                 && text.charAt(pos+4) == '>' ) { 
        next.min = pos;
        next.close = next.min;
      }
      
    } while( next.min === Infinity && pos !== -1 )
    
    return next; 
  };
  
  /**
   * Container for parser functions. 
   * 
   * - getNameFrom : internal function used by other getName* functions
   * - getMarkName : extract bookmark name from text
   * - getFolderName : extract bookmark folder from text
   * 
   * - handleMark : handling bookmark text
   * - handleFolderOpen : handling folder (start) text
   * - handleFolderClose : handling folder (end) text
   * - handleDescr : handling decriptions 
   */
  var parser = { 
    /**
     * Functions to retrieve names
     */
    getNameFrom : function(urlText, from) { 
      from = urlText.indexOf(">", from);
      var nameEndPos = urlText.indexOf("<", from);
      return urlText.substring(from+1, nameEndPos);
    },
    getMarkName : function(urlText) { 
      var nameBeginPos = urlText.search("<A");
      return this.getNameFrom(urlText, nameBeginPos);
    },
    getFolderName : function(urlText) { 
      var nameBeginPos = urlText.search("<H3");
      return this.getNameFrom(urlText, nameBeginPos);
    },
   
    /**
     * Functions to handle different elements
     */  
    handleMark : function(loopText) {
      var markPos = next.min;
      next = findNextElement(loopText, markPos);
      var markText = loopText.substring(markPos, next.min);
         
         // add link 
      var mark = { 
          _text : markText,
          link: null,
          name : this.getMarkName(markText),
          descr : null,
      };
      bookmarks.children.push(mark);
      return mark;
    },
    handleFolderOpen : function(loopText) {
      var folderPos = next.min;
      next = findNextElement(loopText, folderPos);
      var groupText = loopText.substring(folderPos,next.min);
      
      // push folder
      var newFolder = { 
          _text : groupText,
          pre : null,
          name : this.getFolderName(groupText),
          post : null,
          descr : null,
          parent : bookmarks,
          children : []
      };
      bookmarks.children.push(newFolder);
      return newFolder;
    },
    handleFolderClose : function(loopText) { 
      var closePos = next.min;
      next = findNextElement(loopText, closePos);
      var closeText = loopText.substring(closePos, next.min);
      
      // pop folder
      bookmarks.post = closeText;
      if( bookmarks.parent ) { 
        bookmarks = bookmarks.parent;
      }
      return bookmarks;
    }, 
    handleDescr : function(loopText, last) { 
      var descrPos = next.min;
      next = findNextElement(loopText, descrPos);
      var descrText = loopText.substring(descrPos, next.min);
 
      // add descr to last link/mark/url
      last.descr = descrText;
    }
  };
  var loopText = text.substr(text.search("<DL>"));
      
  var bookmarks = { 
     children : []
  };
      
  var next = findNextElement(loopText);
  // save initial text? 
  
  var last = bookmarks;
  
  while(next.min !== Infinity) { 
    
    switch(next.min) { 
    case next.mark:
      last = parser.handleMark(loopText);
      
      break;
      
    case next.folder: 
      bookmarks = parser.handleFolderOpen(loopText);
      last = bookmarks;
      
      break;
      
    case next.close: 
      bookmarks = parser.handleFolderClose(loopText);
      last = bookmarks;
      
      break;
  
    case next.descr: 
      parser.handleDescr(loopText, last);
      
      break;
      
    case undefined: 
      console.log("???" + loopText.substr(nextPos));
      throw new execption();
    }
  }
  
  while( bookmarks.parent ) { 
    bookmarks = bookmarks.parent;
  }
  
  return bookmarks;
}

