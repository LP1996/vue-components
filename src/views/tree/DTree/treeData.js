const treeData = [
  {
    id: 1,
    name: '0-1',
    children: [
      { id: 2, name: '0-1-1' },
      { 
        id: 3, 
        name: '0-1-2', 
        children: [{ id: 4, name: '1-2-1' }]
      },
      { id: 5, name: '0-1-3' },
    ]
  },
  {
    id: 6,
    name: '0-2',
    children: [
      { id: 7, name: '0-2-1' },
      { id: 8, name: '0-2-2' },
      { id: 9, name: '0-2-3' }
    ]
  }
];

const stack = [...treeData];
let startId = 10;

while (stack.length) {
  const node = stack.shift();

  if (node.children) {
    stack.unshift(...node.children);
    continue;
  }

  const children = [];

  for (let i = 0; i < 300; i++) {
    children.push({ id: startId++, name: `${node.name}-${i}` });
  }

  node.children = children;
}

export default treeData;
