fetch('http://localhost:3001/api/gallery').then(r=>r.json()).then(j=>{
  console.log('Templates:', j.templates.length);
  console.log('Categories:', j.categories.join(', '));
  j.templates.forEach(t => console.log(' -', t.id, '|', t.title, '|', t.category));
}).catch(e=>console.error(e));
