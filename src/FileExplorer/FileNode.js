
import React from 'react'

const FileNode = ({node,depth,checkedMap,onCheck,expandedMap,onToggle}) => {
        const hasChildren = !!node.children;
        const checked = checkedMap[node.id] || false;
        const expanded = expandedMap[node.id] || false;

  return (
    <div style={{paddingLeft:depth*20}}
    className={`file-node ${checked && "active"}`}
    onMouseOver={(e)=>e.currentTarget.classList.add("hovered")}
    onMouseOut={(e)=>e.currentTarget.classList.remove("hovered")}
    >
        {hasChildren &&(
            <span
            className='toggle'
            onClick={()=>onToggle(node.id)}
            >{expanded ? "▼" : "►"}</span>
        )}
        <input type="checkbox" checked={checked} onChange={()=>onCheck(node,!checked)}/>
        <span>{node.name}</span>
        {hasChildren && expanded && node.children.map(child=>(
            <FileNode key={child.id} node ={child} depth={depth+1} checkedMap={checkedMap} onCheck={onCheck} expandedMap={expandedMap} onToggle={onToggle} />
        ))}
    </div>
  )
}

export default FileNode