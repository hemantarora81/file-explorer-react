import React, { useEffect, useRef, useState } from "react";

function getFileIcon(name, isFolder) {
  if (isFolder) return "📁";
  const ext = name.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "svg", "bmp"].includes(ext)) return "🖼️";
  if (["pdf"].includes(ext)) return "📄";
  if (["txt", "md"].includes(ext)) return "📝";
  if (["doc", "docx"].includes(ext)) return "📃";
  if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
  if (["js", "ts", "jsx", "tsx"].includes(ext)) return "🟨";
  if (["zip"].includes(ext)) return "🗜️";
  if (["mp3", "wav"].includes(ext)) return "🎵";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "🎬";
  return "📄";
}
const FileNode = ({
  node,
  depth,
  checkedMap,
  onCheck,
  expandedMap,
  onToggle,
  onRename,
  renamingId,
  setRenamingId,
  onAdd,
  onDelete,
  openContextMenu,
  getNodeState = ()=>{},
}) => {
  const hasChildren = !!node.children;
  const expanded = expandedMap[node.id] || false;
  const nameInputRef = useRef(null);
  const { checked, indeterminate } = getNodeState(node);
  useEffect(() => {
    if (renamingId === node.id && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [renamingId, node.id]);

  const [value, setValue] = useState(node.name);
  useEffect(() => {
    setValue(node.name);
  }, [node.name]);

  const saveRename = () => {
    if (value.trim()) {
      onRename(node.id, value.trim());
    } else {
      setValue(node.name);
      setRenamingId(null);
    }
  };

  return (
    <div
      style={{ paddingLeft: depth * 20 }}
      className={`file-node ${checked && "active"}`}
      onMouseOver={(e) => e.currentTarget.classList.add("hovered")}
      onMouseOut={(e) => e.currentTarget.classList.remove("hovered")}
      onContextMenu={(e) => openContextMenu(e, node.id)}
      tabIndex={0}
      aria-level={depth + 1}
      aria-expanded={hasChildren ? expanded : undefined}
      role="treeitem"
    >
      {hasChildren && (
        <span className="toggle" onClick={() => onToggle(node.id)}
        tabIndex={0}
          aria-label={expanded ? "Collapse folder" : "Expand folder"}>
          {expanded ? "▼" : "►"}
        </span>
      )}
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => el && (el.indeterminate = indeterminate)}
        onChange={() => onCheck(node, !checked || indeterminate)}
        aria-checked={indeterminate ? "mixed" : checked}
        tabIndex={0}
      />
     <span style={{ marginRight: 6 }}>
        {getFileIcon(node.name, hasChildren)}
      </span>
      {renamingId === node.id ? (
        <input
          ref={nameInputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={saveRename}
          onKeyDown={e => {
            if (e.key === "Enter") saveRename();
            if (e.key === "Escape") setRenamingId(null);
          }}
          style={{ fontSize: 'inherit', padding: 2 }}
          className="rename-input"
        />
      ) : (
        <span
          onDoubleClick={() => setRenamingId(node.id)}
          className="node-label"
        >
          {node.name}
        </span>
      )}
      {hasChildren &&
  expanded &&
  node.children.map((child) => (
    <FileNode
      key={child.id}
      node={child}
      depth={depth + 1}
      checkedMap={checkedMap}
      onCheck={onCheck}
      expandedMap={expandedMap}
      onToggle={onToggle}
      onRename={onRename}
      renamingId={renamingId}
      setRenamingId={setRenamingId}
      onAdd={onAdd}
      onDelete={onDelete}
      openContextMenu={openContextMenu}
      getNodeState={getNodeState}   
    />
  ))}
    </div>
  );
};

export default FileNode;
