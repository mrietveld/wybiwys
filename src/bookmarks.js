bmv = { version : "0.0.1" };
bmv.parser = { 
  generateTree : function(text) { 

    var loopText = text.substr(text.search("<DL>"));
      
    var bookmarks = { 
        name : "bookmarks",
        children : []
    };
        
    var next = this.findNextElement(loopText);
    // save initial text? 
    
    var lastPos, elemText, 
        last = bookmarks;
    
    while(next.min !== Infinity) { 
      
      switch(next.min) { 
      case next.mark:
        lastPos = next.min;
        next = this.findNextElement(loopText, lastPos);
        elemText = loopText.substring(lastPos, next.min);
        
        // add link 
        var mark = { 
            _text : elemText,
            link: this.getLink(elemText),
            descr : null,
            name : this.getMarkName(elemText),
            children : null
        };
        
        bookmarks.children.push(mark);
        last = mark;
        
        break;
        
      case next.folder: 
        lastPos = next.min;
        next = this.findNextElement(loopText, lastPos);
        elemText = loopText.substring(lastPos, next.min);
        
        // push folder
        var newFolder = { 
            _text : elemText,
            pre : null,
            post : null,
            descr : null,
            parent : bookmarks,
            name : this.getFolderName(elemText),
            children : []
        };
        bookmarks.children.push(newFolder);
        bookmarks = newFolder;
        last = bookmarks;
        break;
        
      case next.close: 
        lastPos = next.min;
        next = this.findNextElement(loopText, lastPos);
        elemText = loopText.substring(lastPos, next.min);
        
        // pop folder
        bookmarks.post = elemText;
        if( bookmarks.parent ) { 
          bookmarks = bookmarks.parent;
        }
        last = bookmarks;
        break;
    
      case next.descr: 
        lastPos = next.min;
        next = this.findNextElement(loopText, lastPos);
        elemText = loopText.substring(lastPos, next.min);
        
        last.descr = elemText;
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
  },
  
  /**
   * Functions to retrieve names
   */
  getNameFrom : function(urlText, from) { 
    from = urlText.indexOf(">", from);
    var nameEndPos = urlText.indexOf("<", from);
    return urlText.substring(from+1, nameEndPos).replace("&#39;", "'");
  },
  getMarkName : function(urlText) { 
    var nameBeginPos = urlText.search("<A");
    return this.getNameFrom(urlText, nameBeginPos);
  },
  getFolderName : function(urlText) { 
    var nameBeginPos = urlText.search("<H3");
    return this.getNameFrom(urlText, nameBeginPos);
  },
  getLink : function(urlText) { 
    var linkBeginPos = urlText.search('HREF="')+6;
    var linkEndPos = urlText.indexOf('"', linkBeginPos);
    return urlText.substring(linkBeginPos, linkEndPos);
  },
   
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
  findNextElement : function(text, from) { 
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
  }
}