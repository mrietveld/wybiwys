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

d3.text("http://localhost:8080/data/bookmarks.html", "text/xml", function(text) {
  
  var textStack = [text.substr(text.search("<DL>"))];
  var folders = [];
  
  var bookmarks = { 
     links : [],
     folders : []
  }
 
  var i = 0;
  while(textStack.length > 0 && textStack[textStack.length-1].length > 0 && i < 10) { 
    ++i;
    
    var loopText = text[text.length-1];
    var next = findNextElement(text);
    var end;
    
    switch(next.min) { 
    case next.folder: 
      var folderText = loopText.substring(next.folder, end+5);
      console.log("> FOLDER [" + folderText.substr(0,20) + "]");
      
      end = loopText.search("</DL>");

      
      loopText = text.substr(end.min+5);
      break;
      
    case next.mark: 
      console.log("! MARK");
      
      end = findNextElement(text.substr(next.mark));
      console.log("  end [" + text.substr(next.mark+end.min,20) + "]");
      var markText = text.substring(next.mark, next.mark+end.min);
     
      // put into bookmarks structure
      console.log(markText);
      
      break;
    case undefined: 
      console.log("???" + text.substr(nextPos));
      throw new execption();
    }
   
  }
  
  function findNextElement(nextText) { 
    
    var text = nextText.substr(1);
    
    var nextFolder = text.search("<DT><H");
    var nextMark = text.search("<DT><A");
    
    nextFolder = nextFolder > 0 ? nextFolder+1 : Infinity;
    nextMark = nextMark > 0 ? nextMark+1 : Infinity;
    
    var nextMin = Math.min(nextFolder, nextMark, nextFeed, nextSlice);
    
    console.log("min [" + nextText.substr(nextMin, 20) + "]");
    
    return { min : nextMin,
             folder : nextFolder, 
             mark : nextMark };
  }
  
}); 