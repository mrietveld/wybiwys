var width = 960,
    height = 2200;
 
var cluster = d3.layout.cluster()
    .size([height, width - 160]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("#chart").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(40, 0)");

d3.text("http://localhost:8080/data/bookmarks.html", "text/xml", function(text) {
 
  generateBookmarkTree(text);
  console.log("!!! DONE !!!");
  
  function generateBookmarkTree(text) { 
    var loopText = text.substr(text.search("<DL>"));
      
    var bookmarks = { 
       links : [],
       folders : []
    };
      
    var i = 0;
    
    var next = findNextElement(loopText);
    // save initial text? 
    
    var kill = 100;
    while(loopText.length > 0 && i < kill) { 
      ++i;
      
      switch(next.min) { 
      case next.mark: 
        var markPos = next.min;
        next = findNextElement(loopText, markPos);
        var markText = loopText.substring(markPos, next.min);
        console.log("! MARK [" + markText + "]");
        
        // add link 
        var mark = {
            all : markText,
            link: null,
            text : null,
            descr : null,
        };
        bookmarks.links.push(mark);
        
        break;
        
      case next.folder: 
        var folderPos = next.min;
        next = findNextElement(loopText, folderPos);
        var groupText = loopText.substring(folderPos,next.min);
        console.log("( GROUP [" + groupText + "]");
        
        // push folder
        var newFolder = { 
            all : groupText,
            pre : null, 
            text : null,
            post : null,
            parent : bookmarks,
            links : [],
            folders : []
        };
        bookmarks.folders.push(newFolder);
        bookmarks = newFolder;
        
        break;
        
      case next.close: 
        var closePos = next.min;
        next = findNextElement(loopText, closePos);
        var closeText = loopText.substring(closePos, next.min);
        console.log(") group [" + closeText + "]");
        
        // pop folder
        bookmarks.post = closeText;
        bookmarks = bookmarks.parent;
        
        break;
    
      case next.descr: 
        var descrPos = next.min;
        next = findNextElement(loopText, descrPos);
        var descrText = loopText.substring(descrPos, next.min);
        console.log("\" DESCR [" + descrText + "]");
  
        // add descr to last link/mark/url
        bookmarks.links[bookmarks.links.length-1].descr = descrText;
        
        break;
        
      case undefined: 
        console.log("???" + loopText.substr(nextPos));
        throw new execption();
      }
    }
    return bookmarks;
  }
  
  
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
      
    } while( next.min == Infinity )
    
    return next; 
  } 
  
}); 