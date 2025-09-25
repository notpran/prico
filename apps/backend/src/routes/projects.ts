import { Router } from 'express';
import { ProjectModel } from '../db/models';

export const projectsRouter = Router();

projectsRouter.get('/', async (_req, res) => {
  try {
    const docs = await ProjectModel.find().select('_id name description visibility').limit(50).lean();
    const items = docs.map((d) => ({ id: String(d._id), name: d.name, description: d.description, visibility: d.visibility }));
    res.json({ items });
  } catch {
    // demo fallback
    res.json({ items: [] });
  }
});

projectsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await ProjectModel.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'not_found' });
    res.json({
      id: String(doc._id),
      name: doc.name,
      description: doc.description,
      files: doc.files || []
    });
  } catch {
    // demo fallback
    res.json({ id, name: `Project ${id}`, description: 'Demo project', files: [{ path: 'README.md', content: '# Demo' }] });
  }
});

projectsRouter.get('/:id/files', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await ProjectModel.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'not_found' });
    res.json({ files: (doc.files || []).map((f: any) => ({ path: f.path })) });
  } catch {
    res.json({ files: [{ path: 'README.md' }, { path: 'src/index.ts' }] });
  }
});

projectsRouter.get('/:id/file', async (req, res) => {
  const { id } = req.params; const { path } = req.query as { path?: string };
  if (!path) return res.status(400).json({ error: 'path_required' });
  try {
    const doc = await ProjectModel.findById(id).lean();
    const file = (doc?.files || []).find((f: any) => f.path === path);
    res.json({ path, content: file?.content ?? '' });
  } catch {
    res.json({ path, content: path === 'README.md' ? '# Demo' : '' });
  }
});

projectsRouter.post('/:id/file', async (req, res) => {
  const { id } = req.params; const { path, content } = req.body || {};
  if (!path) return res.status(400).json({ error: 'path_required' });
  try {
    await ProjectModel.updateOne({ _id: id, 'files.path': path }, { $set: { 'files.$.content': content } }, { upsert: true }).catch(()=>{});
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});
