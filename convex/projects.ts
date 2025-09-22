'use client';

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';

// Get user's projects
export const getUserProjects = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    // Get projects where user is owner
    const ownedProjects = await ctx.db
      .query('projects')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .collect();

    // Get projects where user is a contributor
    const contributions = await ctx.db
      .query('projectContributors')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const contributedProjects = await Promise.all(
      contributions.map(async (contrib) => {
        const project = await ctx.db.get(contrib.projectId);
        return project ? { ...project, role: contrib.role } : null;
      })
    );

    const allProjects = [
      ...ownedProjects.map(p => ({ ...p, role: 'owner' })),
      ...contributedProjects.filter(p => p !== null)
    ];

    // Remove duplicates and sort by last activity
    const uniqueProjects = allProjects.filter((project, index, self) => 
      index === self.findIndex((p) => p._id === project._id)
    );

    return uniqueProjects.sort((a, b) => b.stats.lastActivity - a.stats.lastActivity);
  }
});

// Get public projects for discovery
export const getPublicProjects = query({
  args: { 
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    technology: v.optional(v.array(v.string())),
    language: v.optional(v.string())
  },
  handler: async (ctx, { limit = 20, search, technology, language }) => {
    let projects = await ctx.db
      .query('projects')
      .filter((q) => q.eq(q.field('isPublic'), true))
      .collect();

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      );
    }

    if (technology && technology.length > 0) {
      projects = projects.filter(project =>
        technology.some(tech => project.technology.includes(tech))
      );
    }

    if (language) {
      projects = projects.filter(project =>
        project.language.toLowerCase() === language.toLowerCase()
      );
    }

    // Sort by activity and limit
    projects.sort((a, b) => b.stats.lastActivity - a.stats.lastActivity);
    
    return projects.slice(0, limit);
  }
});

// Get project by ID with full details
export const getProject = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;

    // Get contributors
    const contributors = await ctx.db
      .query('projectContributors')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();

    const contributorDetails = await Promise.all(
      contributors.map(async (contrib) => {
        const user = await ctx.db.get(contrib.userId);
        return user ? { ...contrib, user } : null;
      })
    );

    return {
      ...project,
      contributors: contributorDetails.filter(c => c !== null)
    };
  }
});

// Get project files
export const getProjectFiles = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const files = await ctx.db
      .query('projectFiles')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    return files.sort((a, b) => a.path.localeCompare(b.path));
  }
});

// Create new project
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    slug: v.string(),
    ownerId: v.id('users'),
    isPublic: v.boolean(),
    technology: v.array(v.string()),
    language: v.string(),
    framework: v.optional(v.string()),
    communityId: v.optional(v.id('communities'))
  },
  handler: async (ctx, args) => {
    // Check if slug is unique
    const existing = await ctx.db
      .query('projects')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (existing) {
      throw new Error('Project slug already exists');
    }

    const now = Date.now();
    
    const projectId = await ctx.db.insert('projects', {
      name: args.name,
      description: args.description,
      slug: args.slug,
      ownerId: args.ownerId,
      communityId: args.communityId,
      isPublic: args.isPublic,
      technology: args.technology,
      language: args.language,
      framework: args.framework,
      status: 'planning',
      settings: {
        allowContributions: true,
        requireApproval: false,
        autoSync: false
      },
      stats: {
        contributorCount: 1,
        commitCount: 0,
        linesOfCode: 0,
        lastActivity: now
      },
      createdAt: now,
      updatedAt: now
    });

    // Add owner as contributor
    await ctx.db.insert('projectContributors', {
      projectId,
      userId: args.ownerId,
      role: 'owner',
      permissions: ['read', 'write', 'admin'],
      joinedAt: now,
      lastActivity: now,
      contributionStats: {
        commits: 0,
        linesAdded: 0,
        linesRemoved: 0,
        filesChanged: 0
      }
    });

    return projectId;
  }
});

// Update project
export const updateProject = mutation({
  args: {
    projectId: v.id('projects'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      technology: v.optional(v.array(v.string())),
      language: v.optional(v.string()),
      framework: v.optional(v.string()),
      status: v.optional(v.union(v.literal('planning'), v.literal('active'), v.literal('completed'), v.literal('archived')))
    })
  },
  handler: async (ctx, { projectId, updates }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now()
    });

    return projectId;
  }
});

// Add project contributor
export const addContributor = mutation({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users'),
    role: v.union(v.literal('maintainer'), v.literal('contributor'), v.literal('viewer'))
  },
  handler: async (ctx, { projectId, userId, role }) => {
    const existing = await ctx.db
      .query('projectContributors')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('userId'), userId))
      .first();

    if (existing) {
      throw new Error('User is already a contributor');
    }

    const now = Date.now();
    const permissions = role === 'viewer' ? ['read'] : ['read', 'write'];

    await ctx.db.insert('projectContributors', {
      projectId,
      userId,
      role,
      permissions,
      joinedAt: now,
      lastActivity: now,
      contributionStats: {
        commits: 0,
        linesAdded: 0,
        linesRemoved: 0,
        filesChanged: 0
      }
    });

    // Update project contributor count
    const project = await ctx.db.get(projectId);
    if (project) {
      await ctx.db.patch(projectId, {
        stats: {
          ...project.stats,
          contributorCount: project.stats.contributorCount + 1
        },
        updatedAt: now
      });
    }

    return true;
  }
});

// Create or update project file
export const saveProjectFile = mutation({
  args: {
    projectId: v.id('projects'),
    path: v.string(),
    name: v.string(),
    content: v.string(),
    language: v.string(),
    userId: v.id('users')
  },
  handler: async (ctx, { projectId, path, name, content, language, userId }) => {
    const now = Date.now();
    
    // Check if file exists
    const existing = await ctx.db
      .query('projectFiles')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('path'), path))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .first();

    if (existing) {
      // Update existing file
      await ctx.db.patch(existing._id, {
        content,
        size: content.length,
        lastModifiedBy: userId,
        lastModifiedAt: now,
        version: existing.version + 1
      });
      return existing._id;
    } else {
      // Create new file
      const fileId = await ctx.db.insert('projectFiles', {
        projectId,
        path,
        name,
        content,
        language,
        size: content.length,
        lastModifiedBy: userId,
        lastModifiedAt: now,
        version: 1,
        isDeleted: false,
        createdAt: now
      });
      return fileId;
    }
  }
});

// Delete project file
export const deleteProjectFile = mutation({
  args: {
    fileId: v.id('projectFiles')
  },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    await ctx.db.patch(fileId, {
      isDeleted: true,
      lastModifiedAt: Date.now()
    });

    return true;
  }
});