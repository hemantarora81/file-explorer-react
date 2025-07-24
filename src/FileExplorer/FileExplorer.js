import React from 'react'
import FileNode from './FileNode';
import './FileExplorer.css'
import { fileTree } from '../data';


function buildParentMap(nodes,parent=null,map={}){
    nodes.forEach(node=>{
        if(parent) map[node.id] = parent.id;
        if(node.children) buildParentMap(node.children,map);
    });
    return map;
}

function getChildren(nodes,id){
    for(let node of nodes){
        if(node.id === id) return node.children || [];
        if(node.children) {
            const result = getChildren(node.children,id);
            if(result) return result;
        }
    }
    return null;
}
const getDescendants = node => node.children ? node.children.flatMap(child=>[child.id,...getDescendants(child)]):[];
function traverseAndModify(nodes,id,cb){
    return nodes.map(node=>{
        if(node.id === id) return cb(node);
        if(node.children)
            return {...node,children: traverseAndModify(node.children,id,cb)};
            return node
    })
}
const FileExplorer = ({initialTreeData = fileTree}) => {
    const [treeData,setTreeData]=React.useState(initialTreeData)
    const [checkedMap, setCheckedMap] = React.useState({});
    const [expandedMap, setExpandedMap] = React.useState({});
    const [contextMenu,setContextMenu]=React.useState(null) //{x,y,nodeId}
    const [renamingId,setRenamingId]=React.useState(null) 
    const parentMapRef = React.useRef(buildParentMap(treeData));

    React.useEffect(()=>{
        parentMapRef.current = buildParentMap(treeData);
    },[treeData])

function getNodeState(node){
    if(!node.children) return {checked: !!checkedMap[node.id],indeterminate:false};

    const childStates = node.children.map(child=>getNodeState(child));
    const allChecked = childStates.every(s=>s.checked && !s.indeterminate);
    const someChecked = childStates.some(s => s.checked || s.indeterminate) && !allChecked;
    return{
        checked: allChecked,
        indeterminate: someChecked,
    }
}
function updateParentCheckedState(childId,map){
    const parentId = parentMapRef.current[childId];
    if(!parentId) return;
    const siblings = getChildren(treeData,parentId);
    const allSiblingsChecked = siblings.every(child=>map[child.id]);
    map[parentId] = allSiblingsChecked;
    updateParentCheckedState(parentId,map);
}


    const handleCheck = (node,targetState)=>{
        let newCheckedMap = {...checkedMap};
        newCheckedMap[node.id]=targetState;

        if(node.children){
            getDescendants(node).forEach(id=>{
                newCheckedMap[id]=targetState;
            })
        }
        updateParentCheckedState(node.id,newCheckedMap);
        setCheckedMap(newCheckedMap);
    }


//For Renaming Nodes
const handleRename = (id,newName)=>{
    setTreeData(traverseAndModify(treeData,id,node=>({...node,name:newName})));
    setRenamingId(null);
}
//Add New File/Folder note
const handleAdd=(parentId,isFolder)=>{
  const nextId =
      Math.max(
        ...treeData.flatMap(function grabAllIds(n) {
          return [n.id, ...(n.children ? n.children.flatMap(grabAllIds) : [])];
        }),
      ) + 1;
      const newNode = isFolder ? {id:nextId,name:"New Folder",children:[]}:{id:nextId,name:'New File.txt'};
      setTreeData(traverseAndModify(treeData,parentId,node=>({
        ...node,
        children:node.children ? [...node.children,newNode]:[newNode],
      })));
      setExpandedMap(exp => ({...exp,[parentId]:true}));
};

    const handleDelete = id=>{
        function remove(nodes){
            return nodes.map(node =>
                    node.id === id ? null : node.children ? {...node,children : remove(node.children)}:node,
            ).filter(Boolean);
        }
        setTreeData(remove(treeData));
        setRenamingId(null)
        setContextMenu(null);
    }


    const handleToggle = id=>setExpandedMap(exp=>({...exp,[id]: !exp[id]}));
    const openContextMenu = (e,nodeId)=>{
        e.preventDefault();
        setContextMenu({
            x:e.pageX,
            y:e.pageY,
        })
    };
    const closeContextMenu = ()=>setContextMenu(null);
  return (
    <div className='file-explorer' tabIndex="0" onClick={closeContextMenu}>
        {treeData.map(node=>(
            <FileNode
                key={node.id}
                node={node}
                depth={0}
                checkedMap={checkedMap}
                onCheck={handleCheck}
                expandedMap={expandedMap}
                onToggle={handleToggle}
                onRename={handleRename}
                renamingId={renamingId}
                setRenamingId={setRenamingId}
                onAdd={handleAdd}
                onDelete={handleDelete}
                openContextMenu={openContextMenu}
                getNodeState={getNodeState}
            />
        ))}
        {contextMenu && (
        <ul
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <li onClick={() => { setRenamingId(contextMenu.nodeId); closeContextMenu(); }}>Rename</li>
          <li onClick={() => { handleAdd(contextMenu.nodeId, false); closeContextMenu(); }}>Add File</li>
          <li onClick={() => { handleAdd(contextMenu.nodeId, true); closeContextMenu(); }}>Add Folder</li>
          <li onClick={() => { handleDelete(contextMenu.nodeId); closeContextMenu(); }}>Delete</li>
        </ul>
      )}
    </div>
  )
}

export default FileExplorer