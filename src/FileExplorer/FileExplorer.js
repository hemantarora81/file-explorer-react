import React from 'react'
import FileNode from './FileNode';
import './FileExplorer.css'


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
const FileExplorer = ({treeData}) => {

    const [checkedMap, setCheckedMap] = React.useState({});
    const [expandedMap, setExpandedMap] = React.useState({});
    const parentMapRef = React.useRef(buildParentMap(treeData));


function updateParentCheckedState(childId,map){
    const parentId = parentMapRef.current[childId];
    if(!parentId) return;
    const siblings = getChildren(treeData,parentId);
    const allSiblingsChecked = siblings.every(child=>map[child.id]);
    map[parentId] = allSiblingsChecked;
    updateParentCheckedState(parentId,map);
}


    const handleCheck = (node,isChecked)=>{
        let newCheckedMap = {...checkedMap};
        newCheckedMap[node.id]=isChecked;

        if(node.children){
            getDescendants(node).forEach(id=>{
                newCheckedMap[id]=isChecked;
            })
        }
        updateParentCheckedState(node.id,newCheckedMap);
        setCheckedMap(newCheckedMap);
        // if(!isChecked){
        //     const unsetParents = ancestors =>{
        //         if(!ancestors) return;
        //         newCheckedMap[ancestors.id] = false;
        //         treeData.forEach(node=> traverseAndUnset(node,ancestors.id));
        //     };
        //     function traverseAndUnset(n,targetId){
        //         if(n.children && n.children.some(child=>child.id === node.id)){
        //             newCheckedMap[n.id]=false;
        //             traverseAndUnset(treeData.find(t=>t.id===n.id),n.id);
        //         }
        //         n.children && n.children.forEach(child=>traverseAndUnset(child,targetId));
        //     }
        // }
        // setCheckedMap(newCheckedMap);
    }
    const handleToggle = id=>setExpandedMap(exp=>({...exp,[id]: !exp[id]}));

  return (
    <div className='file-explorer'>
        {treeData.map(node=>(
            <FileNode
            key={node.id}
            node={node}
            depth={0}
            checkedMap={checkedMap}
            onCheck={handleCheck}
            expandedMap={expandedMap}
            onToggle={handleToggle}
            />
        ))}
    </div>
  )
}

export default FileExplorer