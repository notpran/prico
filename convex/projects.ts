import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get user's projects
export const getUserProjects = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    // Get projects where user is owner
    const ownedProjects = await ctx.db
      .query('projects')
      .withIndex('by_owner', (q) => q.eq('owner', userId))
      .collect();

    // Get projects where user is a collaborator
    const allProjects = [...ownedProjects];

    // For each project, check if user is a collaborator
    for (const project of allProjects) {
      const isCollaborator = project.collaborators.some((c: any) => c.user === userId);
      if (isCollaborator) {
        const collaborator = project.collaborators.find((c: any) => c.user === userId);
        project.role = collaborator.role;
      } else {
        project.role = 'owner';
      }
    }

    return allProjects;
  }
});

// Get public projects for discovery
export const getPublicProjects = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    technologies: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string()))
  },
  handler: async (ctx, { limit = 50, search, technologies, tags }) => {
    let projects = await ctx.db
      .query('projects')
      .withIndex('by_public', (q) => q.eq('isPublic', true))
      .collect();

    let filtered = projects;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply technology filter
    if (technologies && technologies.length > 0) {
      filtered = filtered.filter(project =>
        technologies.some(tech => project.technologies.includes(tech))
      );
    }

    // Apply tags filter
    if (tags && tags.length > 0) {
      filtered = filtered.filter(project =>
        tags.some(tag => project.tags.includes(tag))
      );
    }

    return filtered.slice(0, limit);
  }
});

// Get project by slug
export const getProjectBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query('projects')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
  }
});

// Create project
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    slug: v.string(),
    ownerId: v.id('users'),
    isPublic: v.boolean(),
    tags: v.array(v.string()),
    technologies: v.array(v.string()),
    github: v.optional(v.object({
      repoUrl: v.string(),
      repoName: v.string(),
      owner: v.string(),
      isConnected: v.boolean()
    }))
  },
  handler: async (ctx, args) => {
    // Check if slug is already taken
    const existingProject = await ctx.db
      .query('projects')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (existingProject) {
      throw new Error('Project slug already exists');
    }

    const projectId = await ctx.db.insert('projects', {
      name: args.name,
      description: args.description,
      slug: args.slug,
      owner: args.ownerId,
      collaborators: [{
        user: args.ownerId,
        role: 'owner',
        joinedAt: Date.now()
      }],
      isPublic: args.isPublic,
      isArchived: false,
      tags: args.tags,
      technologies: args.technologies,
      github: args.github || {
        isConnected: false
      },
      settings: {
        allowFork: true,
        allowIssues: true,
        allowPullRequests: true,
        defaultBranch: 'main'
      },
      stats: {
        stars: 0,
        forks: 0,
        watchers: 0,
        issues: 0,
        pullRequests: 0
      }
    });

    return projectId;
  }
});

// Update project
export const updateProject = mutation({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    technologies: v.optional(v.array(v.string())),
    github: v.optional(v.object({
      repoUrl: v.string(),
      repoName: v.string(),
      owner: v.string(),
      isConnected: v.boolean()
    }))
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user has permission to update
    const isOwner = project.owner === args.userId;
    const isCollaborator = project.collaborators.some((c: any) => c.user === args.userId && ['owner', 'admin'].includes(c.role));

    if (!isOwner && !isCollaborator) {
      throw new Error('Unauthorized to update project');
    }

    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.isPublic !== undefined) updateData.isPublic = args.isPublic;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.technologies !== undefined) updateData.technologies = args.technologies;
    if (args.github !== undefined) updateData.github = args.github;

    await ctx.db.patch(args.projectId, updateData);
    return true;
  }
});

// Add collaborator to project
export const addCollaborator = mutation({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users'),
    collaboratorId: v.id('users'),
    role: v.union(v.literal('admin'), v.literal('editor'), v.literal('viewer'))
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user has permission to add collaborators
    const isOwner = project.owner === args.userId;
    const isAdmin = project.collaborators.some((c: any) => c.user === args.userId && c.role === 'admin');

    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized to add collaborators');
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find((c: any) => c.user === args.collaboratorId);
    if (existingCollaborator) {
      throw new Error('User is already a collaborator');
    }

    const updatedCollaborators = [
      ...project.collaborators,
      {
        user: args.collaboratorId,
        role: args.role,
        joinedAt: Date.now()
      }
    ];

    await ctx.db.patch(args.projectId, {
      collaborators: updatedCollaborators
    });

    return true;
  }
});

// Remove collaborator from project
export const removeCollaborator = mutation({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users'),
    collaboratorId: v.id('users')
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user has permission to remove collaborators
    const isOwner = project.owner === args.userId;
    const isAdmin = project.collaborators.some((c: any) => c.user === args.userId && c.role === 'admin');

    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized to remove collaborators');
    }

    // Cannot remove owner
    if (args.collaboratorId === project.owner) {
      throw new Error('Cannot remove project owner');
    }

    const updatedCollaborators = project.collaborators.filter((c: any) => c.user !== args.collaboratorId);

    await ctx.db.patch(args.projectId, {
      collaborators: updatedCollaborators
    });

    return true;
  }
});

// Archive/unarchive project
export const toggleArchiveProject = mutation({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user has permission
    const isOwner = project.owner === args.userId;
    const isAdmin = project.collaborators.some((c: any) => c.user === args.userId && ['owner', 'admin'].includes(c.role));

    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized to archive project');
    }

    await ctx.db.patch(args.projectId, {
      isArchived: !project.isArchived
    });

    return !project.isArchived;
  }
});

// Delete project
export const deleteProject = mutation({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Only owner can delete project
    if (project.owner !== args.userId) {
      throw new Error('Only project owner can delete project');
    }

    await ctx.db.delete(args.projectId);
    return true;
  }
});