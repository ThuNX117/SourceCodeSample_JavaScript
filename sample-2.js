/*
convert a WYSIWYG HTML  to Object of contents
migration from old WYSIWYG like *vue-wysiwyg to new WYSIWYG like : tiptap,ckEditor
*/
const NODE_TYPE = {
  HASHTAG: "hashtag",
  MENTION: "mention",
  PARAGRAPH: "paragraph",
  TEXT: "text",
};
const HTML_TYPE = {
  TEXT: "#text",
  SPAN: "SPAN",
  DIV: "DIV",
  BR: "BR",
};
const CLASS_LIST = {
  HASHTAG: "hashtag-tagged",
  USER: "user-tagged",
};
const ALIAS = {
  MENTION: "@",
  HASHTAG: "#",
};

function walkText(_node) {
  return {
    type: NODE_TYPE.TEXT,
    text: _node.nodeValue,
  };
}
function walkSpan(childTag) {
  // read span HTML and return object of contents
  let resultObject = {};
  if (childTag.classList.contains(CLASS_LIST.HASHTAG)) {
    // if child is a hashtag like : #hashtag_summer
    resultObject.type = NODE_TYPE.HASHTAG;
    const index = childTag.innerText.search(ALIAS.HASHTAG);
    resultObject.attrs = {
      id: childTag.attributes["data-hashtag"].nodeValue,
      label: childTag.innerText.slice(index + 1, childTag.innerText.length),
    };
  } else if (childTag.classList.contains(CLASS_LIST.USER)) {
    // if child is a mentions like : @user_1
    resultObject.type = NODE_TYPE.MENTION;
    const index = childTag.innerText.search(ALIAS.MENTION);
    resultObject.attrs = {
      // user id or hashtag id  as data-id, later can be use
      id: childTag.attributes["data-id"].nodeValue,
      label: childTag.innerText.slice(index + 1, childTag.innerText.length),
    };
  }
  return resultObject;
}
function walkDiv(_node) {
  let resultObject = {};
  let content = [];
  resultObject.type = NODE_TYPE.PARAGRAPH;
  if (_node.childNodes && _node.childNodes.length > 0) {
    if (
      _node.childNodes &&
      _node.childNodes.length == 1 &&
      _node.childNodes[0].nodeName == "BR"
    ) {
      //empty expression
    } else {
      _node.childNodes.forEach((item) => {
        content = content.concat(nodeWalk(item));
      });
      resultObject.content = content;
      resultObject.content.push({ type: NODE_TYPE.PARAGRAPH });
    }
  }
  return resultObject;
}
function migrationNote() {
  /* convert HTML to object of contents, this object can be put into new WYSIWYG editor*/
  const doc = document.getElementById("editor-migration");
  let migrationNode = {
    type: "doc",
    content: [],
  };
  if (doc) {
    let migrationContent = this.nodeWalk(doc);
    migrationNode.content.push(migrationContent);
  }
  return migrationNode;
}
function typeOfNode(nodeName) {
  const noteType = {
    B: "bold",
    I: "italic",
    U: "underline",
  };

  return noteType[nodeName] || "";
}
function passDownMarks(nodeJSON) {
  //clean object that was create by methods: minify and optimize layer.
  let resultObject = structuredClone(nodeJSON);
  let marks;
  if (resultObject && resultObject.marks) {
    marks = structuredClone(resultObject.marks);
  }
  if (resultObject.content && resultObject.content.length > 0) {
    if (marks) {
      resultObject.content.forEach((item) => {
        if (item.marks) {
          item.marks = [...item.marks, ...marks];
        } else {
          item.marks = structuredClone(marks);
        }
      });
      // delete resultObject.marks
      delete resultObject.text;
    }
  }
  return resultObject;
}
function simplifyMultipleText($node) {
  let node = structuredClone($node);
  let content = [];
  node.content.forEach((item) => {
    if (item.type == NODE_TYPE.PARAGRAPH && item.content != null) {
      content = [...content, ...item.content];
    } else {
      content.push(item);
    }
  });

  node.content = structuredClone(content);
  if (node.marks) {
    node.content.forEach((item) => {
      if (item.marks) {
        item.marks = structuredClone([...item.marks, ...node.marks]);
      } else {
        item.marks = structuredClone(node.marks);
      }
    });
  }
  return node;
}
function simplifyNodeObject($node) {
  const node = structuredClone($node);
  let result;
  switch (true) {
    case node.type == NODE_TYPE.PARAGRAPH && node.content != null:
      //multiple text
      result = simplifyMultipleText(node);
      break;
    case node.type == NODE_TYPE.HASHTAG || node.type == NODE_TYPE.MENTION:
      result = node;
      break;
    default:
      // text, break line, ,.. is single node, can be return at one
      result = node;
      break;
  }
  return result;
}

function nodeWalk(_node) {
  /*recursive method:
  GO TO EVERY NODE, 
  return Object of CONTENT
   */
  const vm = this;
  let resultObject = {};
  if (!_node) {
    return {};
  }
  let content = [];
  let childTag;
  switch (_node.nodeName) {
    case HTML_TYPE.TEXT:
      resultObject = walkText(_node);
      break;
    case HTML_TYPE.SPAN:
      childTag = _node.children[0];
      resultObject = walkSpan(childTag);
      break;
    case HTML_TYPE.DIV:
      resultObject = walkDiv(_node);
      break;
    case HTML_TYPE.BR:
      resultObject.type = NODE_TYPE.PARAGRAPH;
      break;
    default:
      resultObject = {
        type: NODE_TYPE.PARAGRAPH,
        text: _node.innerText,
        marks: [{ type: vm.typeOfNode(_node.nodeName) }],
      };
      _node.childNodes.forEach((item) => {
        //recursive deep into html DOM
        content = content.concat(vm.nodeWalk(item));
      });
      resultObject.content = content;
      break;
  }
  resultObject = vm.passDownMarks(resultObject);
  resultObject = vm.simplifyNodeObject(resultObject);
  return resultObject;
}
