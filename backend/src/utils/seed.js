require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Skill = require('../models/Skill');
const Evidence = require('../models/Evidence');
const AssessmentResult = require('../models/AssessmentResult');
const RoleDefinition = require('../models/RoleDefinition');
const LearningResource = require('../models/LearningResource');
const LearningProgress = require('../models/LearningProgress');

const seedData = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('[Seeder] Could not connect to MongoDB. Aborting seed operation.');
      process.exit(1);
    }

    console.log('[Seeder] Cleaning existing demo collections...');
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Skill.deleteMany({});
    await Evidence.deleteMany({});
    await AssessmentResult.deleteMany({});
    await RoleDefinition.deleteMany({});
    await LearningResource.deleteMany({});
    await LearningProgress.deleteMany({});

    console.log('[Seeder] Seeding standard technical skills taxonomy...');
    const skills = await Skill.create([
      { name: 'React', category: 'Frontend', description: 'Component-based UI library' },
      { name: 'TypeScript', category: 'Languages', description: 'Typed superset of JavaScript' },
      { name: 'JavaScript', category: 'Languages', description: 'Dynamic client & server scripting' },
      { name: 'Node.js', category: 'Backend', description: 'V8 asynchronous runtime' },
      { name: 'Express.js', category: 'Backend', description: 'Minimalist web framework for Node' },
      { name: 'MongoDB', category: 'Database', description: 'Document-oriented NoSQL database' },
      { name: 'Python', category: 'Languages', description: 'General purpose & AI programming language' },
      { name: 'FastAPI', category: 'Backend', description: 'Modern high-performance async Python framework' },
      { name: 'SQL', category: 'Database', description: 'Structured Query Language for relational schemas' },
      { name: 'Git', category: 'DevOps & Tools', description: 'Distributed version control' },
      { name: 'Docker', category: 'DevOps & Tools', description: 'Containerization and packaging' },
      { name: 'REST APIs', category: 'Architecture', description: 'Representational state transfer web services' },
      { name: 'Data Structures & Algorithms', category: 'CS Fundamentals', description: 'Core problem-solving and algorithmic efficiency' },
    ]);

    console.log('[Seeder] Seeding industry career role definitions...');
    const roles = await RoleDefinition.create([
      {
        title: 'Full-Stack Developer',
        slug: 'full-stack-developer',
        description: 'Designs, implements, and maintains end-to-end web architectures spanning frontend UI, backend microservices, and databases.',
        requiredSkills: [
          { skillName: 'React', minLevel: 75, importance: 'required', category: 'Frontend' },
          { skillName: 'TypeScript', minLevel: 70, importance: 'required', category: 'Languages' },
          { skillName: 'Node.js', minLevel: 75, importance: 'required', category: 'Backend' },
          { skillName: 'Express.js', minLevel: 70, importance: 'required', category: 'Backend' },
          { skillName: 'MongoDB', minLevel: 65, importance: 'required', category: 'Database' },
          { skillName: 'REST APIs', minLevel: 75, importance: 'required', category: 'Architecture' },
          { skillName: 'Git', minLevel: 70, importance: 'required', category: 'DevOps & Tools' },
          { skillName: 'Docker', minLevel: 55, importance: 'preferred', category: 'DevOps & Tools' },
          { skillName: 'Data Structures & Algorithms', minLevel: 65, importance: 'preferred', category: 'CS Fundamentals' },
        ],
      },
      {
        title: 'Frontend Developer',
        slug: 'frontend-developer',
        description: 'Specializes in crafting responsive, accessible, high-performance web applications with modern component libraries.',
        requiredSkills: [
          { skillName: 'React', minLevel: 80, importance: 'required', category: 'Frontend' },
          { skillName: 'TypeScript', minLevel: 75, importance: 'required', category: 'Languages' },
          { skillName: 'JavaScript', minLevel: 80, importance: 'required', category: 'Languages' },
          { skillName: 'REST APIs', minLevel: 70, importance: 'required', category: 'Architecture' },
          { skillName: 'Git', minLevel: 65, importance: 'required', category: 'DevOps & Tools' },
        ],
      },
      {
        title: 'Backend Developer',
        slug: 'backend-developer',
        description: 'Engineers scalable server-side systems, REST/gRPC interfaces, relational/NoSQL schemas, and asynchronous workflows.',
        requiredSkills: [
          { skillName: 'Node.js', minLevel: 80, importance: 'required', category: 'Backend' },
          { skillName: 'Express.js', minLevel: 75, importance: 'required', category: 'Backend' },
          { skillName: 'MongoDB', minLevel: 75, importance: 'required', category: 'Database' },
          { skillName: 'SQL', minLevel: 70, importance: 'required', category: 'Database' },
          { skillName: 'REST APIs', minLevel: 85, importance: 'required', category: 'Architecture' },
          { skillName: 'Git', minLevel: 70, importance: 'required', category: 'DevOps & Tools' },
          { skillName: 'Docker', minLevel: 60, importance: 'preferred', category: 'DevOps & Tools' },
        ],
      },
      {
        title: 'Data Analyst',
        slug: 'data-analyst',
        description: 'Extracts actionable business and statistical intelligence from complex tabular and unstructured data stores.',
        requiredSkills: [
          { skillName: 'Python', minLevel: 80, importance: 'required', category: 'Languages' },
          { skillName: 'SQL', minLevel: 80, importance: 'required', category: 'Database' },
          { skillName: 'Git', minLevel: 60, importance: 'preferred', category: 'DevOps & Tools' },
        ],
      },
      {
        title: 'DevOps Engineer',
        slug: 'devops-engineer',
        description: 'Automates CI/CD pipelines, container orchestration, cloud infrastructure provisioning, and service reliability.',
        requiredSkills: [
          { skillName: 'Docker', minLevel: 80, importance: 'required', category: 'DevOps & Tools' },
          { skillName: 'Git', minLevel: 75, importance: 'required', category: 'DevOps & Tools' },
          { skillName: 'Python', minLevel: 65, importance: 'preferred', category: 'Languages' },
          { skillName: 'Node.js', minLevel: 60, importance: 'preferred', category: 'Backend' },
        ],
      },
    ]);

    console.log('[Seeder] Seeding curated learning resources...');
    const resources = await LearningResource.create([
      {
        title: 'Full Stack Open: Deep Dive into Modern Web Development',
        description: 'University of Helsinki course covering React, Redux, Node.js, Express, and MongoDB with modern testing and deployment.',
        targetSkills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'TypeScript'],
        sourceName: 'University of Helsinki',
        sourceUrl: 'https://fullstackopen.com/en/',
        difficulty: 'Intermediate',
        estimatedHours: 40,
        isDemo: true,
      },
      {
        title: 'TypeScript for JavaScript Programmers',
        description: 'Official documentation and practical interactive handbook to master static type safety and generics.',
        targetSkills: ['TypeScript', 'JavaScript'],
        sourceName: 'Official TypeScript Documentation',
        sourceUrl: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',
        difficulty: 'Intermediate',
        estimatedHours: 12,
        isDemo: true,
      },
      {
        title: 'Docker for Beginners: Hands-On Containerization',
        description: 'Master containerization fundamentals, Dockerfile authoring, multi-container Docker Compose, and local testing environments.',
        targetSkills: ['Docker', 'DevOps & Tools'],
        sourceName: 'freeCodeCamp',
        sourceUrl: 'https://www.freecodecamp.org/news/docker-for-beginners-free-course/',
        difficulty: 'Beginner',
        estimatedHours: 15,
        isDemo: true,
      },
      {
        title: 'CS50: Introduction to Computer Science',
        description: 'Harvard University foundation in computational thinking, memory allocation, algorithms, and data structures.',
        targetSkills: ['Data Structures & Algorithms', 'CS Fundamentals'],
        sourceName: 'Harvard University / edX',
        sourceUrl: 'https://cs50.harvard.edu/x/',
        difficulty: 'Intermediate',
        estimatedHours: 60,
        isDemo: true,
      },
      {
        title: 'Designing Data-Intensive Applications & MongoDB Foundations',
        description: 'Architecting distributed document schemas, indexes, and aggregation pipelines for production web services.',
        targetSkills: ['MongoDB', 'Database', 'REST APIs'],
        sourceName: 'MongoDB University',
        sourceUrl: 'https://learn.mongodb.com/',
        difficulty: 'Intermediate',
        estimatedHours: 20,
        isDemo: true,
      },
      {
        title: 'FastAPI for Python Developers',
        description: 'Build production-ready, asynchronous web APIs with Python, automatic Pydantic validation, and OpenAPI documentation.',
        targetSkills: ['Python', 'FastAPI', 'REST APIs'],
        sourceName: 'FastAPI Official Documentation',
        sourceUrl: 'https://fastapi.tiangolo.com/tutorial/',
        difficulty: 'Intermediate',
        estimatedHours: 16,
        isDemo: true,
      },
    ]);

    console.log('[Seeder] Creating demo student account...');
    const demoStudent = await User.create({
      name: 'Aamrapali Sharma',
      email: 'student@skillbridge.edu',
      password: 'Student@123',
      role: 'student',
      accountStatus: 'active',
    });

    console.log('[Seeder] Creating demo student profile...');
    const fullStackRole = roles.find((r) => r.slug === 'full-stack-developer');
    const demoProfile = await StudentProfile.create({
      user: demoStudent._id,
      headline: 'Aspiring Full-Stack Software Engineer | React, Node.js & Cloud Enthusiast',
      bio: 'Third-year Computer Science student passionate about building performant, accessible web systems. Actively developing projects using React, Node.js, and MongoDB while preparing for software placement drives.',
      contactNumber: '+91 9876543210',
      technicalInterests: ['React', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'Docker', 'REST APIs'],
      academic: {
        college: 'Apex Institute of Technology',
        department: 'Computer Science & Engineering',
        degree: 'Bachelor of Technology',
        currentYear: 3,
        graduationYear: 2026,
        cgpa: 8.75,
      },
      socialLinks: {
        github: 'https://github.com/aamrapali-dev',
        linkedin: 'https://linkedin.com/in/aamrapali-sharma',
        leetcode: 'https://leetcode.com/u/aamrapali_code',
        codeforces: '',
        portfolio: 'https://aamrapali.dev',
        otherLinks: ['https://dev.to/aamrapali'],
      },
      targetRoleId: fullStackRole ? fullStackRole._id : null,
    });

    console.log('[Seeder] Seeding student evidence records...');
    const evidenceItems = await Evidence.create([
      {
        student: demoStudent._id,
        title: 'Department Full-Stack Diagnostic Assessment',
        type: 'assessment',
        source: 'SkillBridge College Assessment Engine',
        sourceUrl: '',
        description: 'Proctored 3-hour examination testing React component architecture, Node.js API endpoints, and MongoDB aggregations.',
        relatedSkills: ['React', 'TypeScript', 'Node.js', 'Express.js', 'REST APIs'],
        score: 92,
        verificationStatus: 'verified',
        connectionStatus: 'connected_verified',
        evidenceDate: new Date('2026-09-20'),
      },
      {
        student: demoStudent._id,
        title: 'SkillBridge Web Portal Project',
        type: 'project',
        source: 'GitHub',
        sourceUrl: 'https://github.com/aamrapali-dev/skillbridge-portal',
        description: 'Full-stack application featuring student portfolio dashboards, responsive navigation, and authenticated REST APIs.',
        relatedSkills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        verificationStatus: 'verified',
        connectionStatus: 'url_added',
        evidenceDate: new Date('2026-08-15'),
      },
      {
        student: demoStudent._id,
        title: 'Full-Stack Web Development Certification',
        type: 'certificate',
        source: 'University of Helsinki / Coursera',
        sourceUrl: 'https://fullstackopen.com/certificate/sample-aamrapali',
        description: 'Comprehensive certification covering modern JavaScript frameworks, state management, RESTful microservices, and database indexing.',
        relatedSkills: ['React', 'JavaScript', 'Node.js', 'REST APIs'],
        verificationStatus: 'verified',
        connectionStatus: 'url_added',
        evidenceDate: new Date('2026-07-10'),
      },
      {
        student: demoStudent._id,
        title: 'Software Development Intern at TechNova Solutions',
        type: 'internship',
        source: 'TechNova Solutions',
        sourceUrl: '',
        description: 'Contributed to front-end refactoring and backend bug fixes during a 2-month summer internship, improving bundle size by 18%.',
        relatedSkills: ['React', 'Git', 'JavaScript', 'REST APIs'],
        verificationStatus: 'verified',
        connectionStatus: 'connected_verified',
        evidenceDate: new Date('2026-06-30'),
      },
      {
        student: demoStudent._id,
        title: 'LeetCode Problem-Solving Track',
        type: 'coding_profile',
        source: 'LeetCode',
        sourceUrl: 'https://leetcode.com/u/aamrapali_code',
        description: 'Over 220+ problems solved across arrays, dynamic programming, trees, and graph algorithms.',
        relatedSkills: ['Data Structures & Algorithms', 'JavaScript'],
        verificationStatus: 'pending',
        connectionStatus: 'url_added',
        evidenceDate: new Date('2026-10-01'),
      },
      {
        student: demoStudent._id,
        title: 'National Hackathon Runner-Up Project',
        type: 'achievement',
        source: 'Smart City Hackathon 2026',
        sourceUrl: 'https://devpost.com/software/civic-pulse',
        description: 'Built a real-time civic grievance dashboard using React and Express. Won 2nd place out of 120 college teams.',
        relatedSkills: ['React', 'Express.js', 'MongoDB'],
        verificationStatus: 'verified',
        connectionStatus: 'url_added',
        evidenceDate: new Date('2026-04-18'),
      },
    ]);

    console.log('[Seeder] Seeding diagnostic assessment results...');
    await AssessmentResult.create({
      student: demoStudent._id,
      title: 'Department Full-Stack Diagnostic Assessment',
      assessmentType: 'College Proctored Assessment',
      score: 92,
      maxScore: 100,
      skillsAssessed: ['React', 'TypeScript', 'Node.js', 'Express.js', 'REST APIs'],
      completionDate: new Date('2026-09-20'),
    });

    console.log('[Seeder] Seeding student learning progress...');
    const dockerCourse = resources.find((r) => r.targetSkills.includes('Docker'));
    const tsCourse = resources.find((r) => r.title.includes('TypeScript'));
    const fullStackCourse = resources.find((r) => r.title.includes('Full Stack Open'));

    if (dockerCourse) {
      await LearningProgress.create({
        student: demoStudent._id,
        resource: dockerCourse._id,
        status: 'in_progress',
        progressPercentage: 45,
        startDate: new Date('2026-10-05'),
        notes: 'Completed Modules 1-3 on container creation and Dockerfile instructions.',
      });
    }

    if (fullStackCourse) {
      await LearningProgress.create({
        student: demoStudent._id,
        resource: fullStackCourse._id,
        status: 'completed',
        progressPercentage: 100,
        startDate: new Date('2026-06-01'),
        completedDate: new Date('2026-07-25'),
        notes: 'Passed all final project submissions and received course honors.',
      });
    }

    if (tsCourse) {
      await LearningProgress.create({
        student: demoStudent._id,
        resource: tsCourse._id,
        status: 'recommended',
        progressPercentage: 0,
        notes: 'Queued to bridge advanced generic typing gaps.',
      });
    }

    console.log('====================================================');
    console.log('✅ SkillBridge Database Seeding Completed Successfully!');
    console.log('====================================================');
    console.log('Demo Student Credentials:');
    console.log('  Email:    student@skillbridge.edu');
    console.log('  Password: Student@123');
    console.log('  Role:     student');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
