"""
SkillBridge AI Service — Skills Taxonomy
=========================================
A curated, hand-crafted taxonomy of ~45 technical skills used in engineering
and computer science placements.

Structure per skill entry:
    aliases  : Canonical terms / abbreviations for the skill itself.
               An alias match yields a higher confidence base score than a
               keyword-only match.  All entries must be lowercase.
    keywords : Libraries, frameworks, tools, or concepts that are STRONGLY
               associated with this skill and do NOT commonly appear in
               unrelated contexts.  A keyword match alone is weaker but still
               counts.  Generic words (e.g. "data", "code", "project") are
               deliberately excluded to prevent false positives.
    category : Grouping for future analytics.

Design rules applied here to avoid false positives:
  1. Every alias and keyword is matched with a word-boundary regex (\b).
  2. Short or ambiguous tokens (e.g. "c", "r", "go") have aliases that
     require additional surrounding context — see the extractor for details.
  3. Common English words are never used as standalone triggers.
  4. Acronyms are only included when they are unambiguous in a tech CV
     (e.g. "OOP" always means Object-Oriented Programming).
"""

from typing import Dict, List

# Type alias for readability
SkillEntry = Dict[str, List[str] | str]

SKILLS_TAXONOMY: Dict[str, SkillEntry] = {

    # ── Programming Languages ──────────────────────────────────────────────

    "Python": {
        "aliases": ["python", "python3", "python2"],
        "keywords": [
            "django", "flask", "fastapi", "pandas", "numpy", "scipy",
            "matplotlib", "seaborn", "pytest", "pip", "conda", "jupyter",
            "notebook", "ipython", "pycharm", "virtualenv", "celery",
            "sqlalchemy", "pydantic", "asyncio",
        ],
        "category": "programming_language",
    },

    "JavaScript": {
        "aliases": ["javascript", "js", "ecmascript", "es6", "es2015"],
        "keywords": [
            "node", "nodejs", "npm", "yarn", "webpack", "babel",
            "eslint", "jest", "mocha", "express", "lodash", "axios",
            "promise", "async/await", "v8", "deno",
        ],
        "category": "programming_language",
    },

    "TypeScript": {
        "aliases": ["typescript", "ts"],
        "keywords": ["tsc", "tsconfig", "type-safe", "typed javascript"],
        "category": "programming_language",
    },

    "Java": {
        "aliases": ["java"],
        "keywords": [
            "spring", "springboot", "spring boot", "maven", "gradle",
            "junit", "jvm", "jdk", "jre", "hibernate", "tomcat",
            "servlet", "jpa", "eclipse", "intellij",
        ],
        "category": "programming_language",
    },

    "C++": {
        "aliases": ["c++", "cpp", "c plus plus"],
        "keywords": [
            "stl", "standard template library", "boost", "cmake",
            "makefile", "g++", "clang", "valgrind", "openmp", "cuda",
            "qt framework", "conan",
        ],
        "category": "programming_language",
    },

    "C": {
        # "C" is a single letter — matched only when surrounded by word
        # boundaries AND not followed by "++" or "#" (handled in extractor).
        "aliases": ["c programming", "c language"],
        "keywords": [
            "gcc", "gdb", "makefile", "malloc", "pointer arithmetic",
            "struct", "embedded c", "c99", "c11", "ansi c",
        ],
        "category": "programming_language",
    },

    "C#": {
        "aliases": ["c#", "csharp", "c sharp"],
        "keywords": [
            "dotnet", ".net", "asp.net", "blazor", "unity", "xamarin",
            "nuget", "linq", "wpf", "uwp", "entity framework",
        ],
        "category": "programming_language",
    },

    "Go": {
        # "Go" is short — matched only as a whole word; keywords disambiguate.
        "aliases": ["golang"],
        "keywords": [
            "goroutine", "go module", "gofmt", "gin framework",
            "go standard library", "go concurrency", "gotest",
        ],
        "category": "programming_language",
    },

    "PHP": {
        "aliases": ["php"],
        "keywords": [
            "laravel", "symfony", "wordpress", "drupal", "composer",
            "phpunit", "blade template", "artisan",
        ],
        "category": "programming_language",
    },

    "Ruby": {
        "aliases": ["ruby"],
        "keywords": ["rails", "ruby on rails", "sinatra", "rspec", "gem", "bundler"],
        "category": "programming_language",
    },

    "Swift": {
        "aliases": ["swift"],
        "keywords": ["xcode", "ios development", "swiftui", "cocoapods", "uikit"],
        "category": "programming_language",
    },

    "Kotlin": {
        "aliases": ["kotlin"],
        "keywords": [
            "android development", "android studio", "jetpack compose",
            "coroutine", "gradle kotlin",
        ],
        "category": "programming_language",
    },

    "R": {
        # Very short name — only aliases used; never matched on the letter "R" alone.
        "aliases": ["r programming", "r language", "r studio", "rstudio"],
        "keywords": ["ggplot", "tidyverse", "dplyr", "shiny", "cran", "knitr"],
        "category": "programming_language",
    },

    "Dart": {
        "aliases": ["dart"],
        "keywords": ["flutter", "pub.dev", "dartpad"],
        "category": "programming_language",
    },

    # ── Frontend ───────────────────────────────────────────────────────────

    "React": {
        "aliases": ["react", "reactjs", "react.js"],
        "keywords": [
            "jsx", "tsx", "redux", "react router", "react hooks",
            "usestate", "useeffect", "react native", "create-react-app",
            "vite react", "next.js", "nextjs", "react context",
        ],
        "category": "frontend",
    },

    "Angular": {
        "aliases": ["angular", "angularjs"],
        "keywords": [
            "ng", "angular cli", "rxjs", "ngmodule", "typescript angular",
            "angular material", "zone.js",
        ],
        "category": "frontend",
    },

    "Vue.js": {
        "aliases": ["vue", "vuejs", "vue.js"],
        "keywords": ["vuex", "nuxt", "vue router", "vue cli", "composition api"],
        "category": "frontend",
    },

    "Next.js": {
        "aliases": ["next.js", "nextjs"],
        "keywords": [
            "server-side rendering", "ssr", "static site generation",
            "ssg", "next api routes",
        ],
        "category": "frontend",
    },

    "HTML": {
        "aliases": ["html", "html5"],
        "keywords": [
            "semantic html", "html markup", "web page", "dom",
            "html template", "html form",
        ],
        "category": "frontend",
    },

    "CSS": {
        "aliases": ["css", "css3"],
        "keywords": [
            "flexbox", "css grid", "media query", "stylesheet",
            "animation css", "scss", "sass", "less css",
        ],
        "category": "frontend",
    },

    "Tailwind CSS": {
        "aliases": ["tailwind", "tailwindcss", "tailwind css"],
        "keywords": ["utility-first css", "tailwind config"],
        "category": "frontend",
    },

    "Bootstrap": {
        "aliases": ["bootstrap"],
        "keywords": ["bootstrap grid", "bootstrap component", "bs4", "bs5"],
        "category": "frontend",
    },

    # ── Backend ────────────────────────────────────────────────────────────

    "Node.js": {
        "aliases": ["node.js", "nodejs", "node js"],
        "keywords": [
            "express", "expressjs", "express.js", "npm", "yarn",
            "event loop", "fs module", "http module",
        ],
        "category": "backend",
    },

    "Express.js": {
        "aliases": ["express", "expressjs", "express.js"],
        "keywords": [
            "middleware express", "router express", "express route",
            "express api", "multer", "passport.js",
        ],
        "category": "backend",
    },

    "Django": {
        "aliases": ["django"],
        "keywords": [
            "django rest framework", "drf", "django orm", "django models",
            "django views", "django admin", "django migrations",
        ],
        "category": "backend",
    },

    "Flask": {
        "aliases": ["flask"],
        "keywords": [
            "flask blueprint", "flask-sqlalchemy", "flask-login",
            "flask-restful", "jinja2", "werkzeug",
        ],
        "category": "backend",
    },

    "FastAPI": {
        "aliases": ["fastapi", "fast api"],
        "keywords": [
            "pydantic", "uvicorn", "starlette", "openapi fastapi",
            "dependency injection fastapi",
        ],
        "category": "backend",
    },

    "Spring Boot": {
        "aliases": ["spring boot", "springboot"],
        "keywords": [
            "spring mvc", "spring data", "spring security",
            "spring rest", "spring jpa", "spring cloud",
        ],
        "category": "backend",
    },

    # ── Databases ──────────────────────────────────────────────────────────

    "SQL": {
        "aliases": ["sql"],
        "keywords": [
            "select query", "join query", "sql query", "stored procedure",
            "trigger sql", "index sql", "relational database",
            "normalization", "primary key", "foreign key",
        ],
        "category": "database",
    },

    "MySQL": {
        "aliases": ["mysql"],
        "keywords": ["mysqldump", "innodb", "mysql workbench"],
        "category": "database",
    },

    "PostgreSQL": {
        "aliases": ["postgresql", "postgres"],
        "keywords": [
            "psql", "pgadmin", "pg_dump", "postgresql query",
            "postgresql index",
        ],
        "category": "database",
    },

    "MongoDB": {
        "aliases": ["mongodb", "mongo"],
        "keywords": [
            "mongoose", "nosql", "document database", "bson",
            "mongodb atlas", "aggregation pipeline", "mongodb query",
            "collection mongodb", "mongodb index",
        ],
        "category": "database",
    },

    "Redis": {
        "aliases": ["redis"],
        "keywords": ["redis cache", "pub/sub redis", "redis cluster", "redisson"],
        "category": "database",
    },

    "Firebase": {
        "aliases": ["firebase"],
        "keywords": [
            "firestore", "realtime database", "firebase auth",
            "firebase hosting", "cloud functions firebase",
        ],
        "category": "database",
    },

    # ── AI / Machine Learning ──────────────────────────────────────────────

    "Machine Learning": {
        "aliases": ["machine learning", "ml"],
        "keywords": [
            "scikit-learn", "sklearn", "supervised learning",
            "unsupervised learning", "classification model",
            "regression model", "random forest", "gradient boosting",
            "xgboost", "feature engineering", "cross-validation",
            "hyperparameter", "training data", "test accuracy",
        ],
        "category": "ai_ml",
    },

    "Deep Learning": {
        "aliases": ["deep learning", "neural network", "neural networks"],
        "keywords": [
            "cnn", "rnn", "lstm", "transformer model", "backpropagation",
            "activation function", "dropout", "batch normalization",
            "convolutional", "recurrent", "encoder decoder",
        ],
        "category": "ai_ml",
    },

    "TensorFlow": {
        "aliases": ["tensorflow", "tf"],
        "keywords": [
            "keras", "tf.keras", "tensorflow lite", "tensorflow hub",
            "tfrecord", "tensorflow serving",
        ],
        "category": "ai_ml",
    },

    "PyTorch": {
        "aliases": ["pytorch", "torch"],
        "keywords": [
            "torchvision", "torchaudio", "autograd", "dataloader pytorch",
            "pytorch lightning",
        ],
        "category": "ai_ml",
    },

    "NLP": {
        "aliases": ["nlp", "natural language processing"],
        "keywords": [
            "text classification", "named entity recognition", "ner",
            "sentiment analysis", "tokenization", "word embedding",
            "word2vec", "bert", "gpt", "hugging face", "spacy", "nltk",
        ],
        "category": "ai_ml",
    },

    "Computer Vision": {
        "aliases": ["computer vision", "cv"],
        "keywords": [
            "opencv", "image classification", "object detection",
            "image segmentation", "yolo", "resnet", "vgg",
        ],
        "category": "ai_ml",
    },

    # ── DevOps / Tools ─────────────────────────────────────────────────────

    "Git": {
        "aliases": ["git"],
        "keywords": [
            "github", "gitlab", "bitbucket", "version control",
            "git commit", "git branch", "git merge", "pull request",
            "git rebase", "git stash",
        ],
        "category": "devops_tools",
    },

    "Docker": {
        "aliases": ["docker"],
        "keywords": [
            "dockerfile", "docker-compose", "docker container",
            "docker image", "docker hub", "docker swarm",
            "container orchestration",
        ],
        "category": "devops_tools",
    },

    "Linux": {
        "aliases": ["linux", "ubuntu", "debian", "centos", "fedora", "unix"],
        "keywords": [
            "bash scripting", "shell script", "cron job", "ssh",
            "linux command", "systemd", "grep", "awk", "sed",
        ],
        "category": "devops_tools",
    },

    "REST API": {
        "aliases": ["rest api", "restful", "rest"],
        "keywords": [
            "http methods", "get request", "post request", "put request",
            "delete request", "api endpoint", "json response",
            "status code", "swagger", "openapi",
        ],
        "category": "devops_tools",
    },

    "GraphQL": {
        "aliases": ["graphql"],
        "keywords": ["apollo", "graphql query", "graphql mutation", "graphql schema"],
        "category": "devops_tools",
    },

    "AWS": {
        "aliases": ["aws", "amazon web services"],
        "keywords": [
            "ec2", "s3", "lambda", "rds aws", "iam aws", "cloudwatch",
            "dynamodb", "elastic beanstalk", "sqs", "sns",
        ],
        "category": "devops_tools",
    },

    "Azure": {
        "aliases": ["azure", "microsoft azure"],
        "keywords": [
            "azure functions", "azure devops", "azure blob", "azure sql",
            "azure active directory",
        ],
        "category": "devops_tools",
    },

    # ── CS Fundamentals ────────────────────────────────────────────────────

    "Data Structures": {
        "aliases": ["data structures", "dsa"],
        "keywords": [
            "linked list", "stack data structure", "queue data structure",
            "stacks and queues", "tree traversal", "binary tree",
            "binary search tree", "heap data structure", "graph traversal",
            "hash map", "hash table", "trie", "sliding window", "two pointer",
        ],
        "category": "cs_fundamentals",
    },

    "Algorithms": {
        "aliases": ["algorithms", "algorithm design"],
        "keywords": [
            "sorting algorithm", "searching algorithm", "dynamic programming",
            "greedy algorithm", "divide and conquer", "recursion",
            "big o", "time complexity", "space complexity",
            "breadth first search", "depth first search", "bfs", "dfs",
            "dijkstra", "binary search",
        ],
        "category": "cs_fundamentals",
    },

    "OOP": {
        "aliases": ["oop", "object-oriented programming", "object oriented programming"],
        "keywords": [
            "inheritance", "polymorphism", "encapsulation", "abstraction",
            "design pattern", "solid principles", "uml diagram",
        ],
        "category": "cs_fundamentals",
    },

    "System Design": {
        "aliases": ["system design"],
        "keywords": [
            "scalability", "load balancer", "microservices", "api gateway",
            "caching strategy", "message queue", "database sharding",
            "cap theorem", "distributed system",
        ],
        "category": "cs_fundamentals",
    },
}

