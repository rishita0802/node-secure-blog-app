🚀 NodeNexus: Secure Cloud-Powered Blog PlatformNodeNexus is a modern, full-stack blogging application built with Node.js and Express. It leverages TiDB Cloud (MySQL Serverless) for a scalable, high-availability database experience and features a premium Deep Ocean dark-mode UI.✨ Key Features🔐 Security & AuthenticationCloud-Native Database: Integrated with TiDB Cloud (Serverless MySQL) for robust data persistence.Bcrypt Password Hashing: Implements industry-standard salting and hashing to protect user credentials.Role-Based Access Control (RBAC):Admin: Full administrative rights to moderate content and delete any post.User: Ability to create posts, manage their own content, and engage with others.Session Management: Uses express-session for secure, stateful user authentication.📝 Core FunctionalityFull CRUD Operations: Seamlessly Create, Read, Update, and Delete blog posts.Social Interactions: Real-time engagement features including Likes, Dislikes, and Nested Comments.Dynamic UI: A responsive, polished Deep Ocean Theme crafted with vanilla CSS for a sleek user experience.Image Handling: Integrated with Multer for efficient multipart/form-data (image) uploads.🛠️ Tech StackLayerTechnologyFrontendHTML5, CSS3 (Deep Ocean Theme), Vanilla JavaScriptBackendNode.js, Express.jsDatabaseTiDB Cloud (Serverless MySQL)AuthenticationBcrypt.js, Express-SessionFile UploadsMulter🚀 Installation and Setup1. Clone the RepositoryBashgit clone https://github.com/rishita0802/node-secure-blog-app
cd node-nexus-blog
2. Install DependenciesBashnpm install
3. Configure Environment Variables (.env)Create a .env file in the root directory and add your TiDB Cloud credentials:Code snippetDB_HOST=your_tidb_host
DB_USER=your_tidb_username
DB_PASSWORD=your_tidb_password
DB_NAME=test
DB_PORT=4000
SESSION_SECRET=your_random_secret_key
PORT=3000
4. Initialize DatabaseRun the SQL schema provided in the /database folder (or via TiDB SQL Editor) to create the users and blogs tables.5. Start the ApplicationBashnode server3.js
Open your browser and navigate to http://localhost:3000.🛡️ LicenseDistributed under the MIT License. See LICENSE for more information.