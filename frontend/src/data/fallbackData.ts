import type { PortfolioData } from '../types/portfolio';

export const fallbackData: PortfolioData = {
  profile: {
    fullName: 'Yakshit Koshiya',
    siteName: 'Yakshit Portfolio',
    typingTitles: ['Full Stack MERN Developer', 'React Developer', 'Problem Solver'],
    about: "I'm Yakshit Koshiya, a B.Tech Information Technology student and Full Stack MERN Developer. I enjoy building modern, responsive, and user-friendly web applications using technologies like React, Node.js, Express.js, and MongoDB.\n\nI have hands-on experience developing real-world projects, including business websites, ERP systems, admin panels, REST APIs, and WhatsApp API integrations. I'm passionate about learning new technologies, solving problems, and turning ideas into practical digital solutions.\n\nCurrently, I'm looking for opportunities where I can apply my skills, gain industry experience, and grow as a professional software developer.",
    socials: {
      github: 'https://github.com/yakshit0511',
      linkedin: 'https://www.linkedin.com/in/yakshit-koshiya-b49a11296/',
      instagram: 'https://www.instagram.com/yakshit_0511',
    },
    seo: {
      title: 'Yakshit Portfolio | Full Stack MERN Developer',
      description: 'Yakshit Koshiya is a Full Stack MERN Developer building modern, responsive web applications.',
    },
    accentColor: '#2f7bff',
  },
  sections: [
    { key: 'about', title: 'About', visible: true, order: 0 },
    { key: 'skills', title: 'Skills', visible: true, order: 1 },
    { key: 'projects', title: 'Projects', visible: true, order: 2 },
    { key: 'education', title: 'Education', visible: true, order: 3 },
    { key: 'experience', title: 'Experience', visible: true, order: 4 },
    { key: 'contact', title: 'Contact', visible: true, order: 5 },
  ],
  skills: [
    { category: 'Frontend', items: [
      { name: 'HTML5', category: 'Frontend', level: 90 }, { name: 'CSS3', category: 'Frontend', level: 88 },
      { name: 'JavaScript', category: 'Frontend', level: 90 }, { name: 'React.js', category: 'Frontend', level: 91 },
      { name: 'TypeScript', category: 'Frontend', level: 82 }, { name: 'Tailwind CSS', category: 'Frontend', level: 84 },
      { name: 'Bootstrap', category: 'Frontend', level: 86 },
    ] },
    { category: 'Backend', items: [
      { name: 'Node.js', category: 'Backend', level: 88 }, { name: 'Express.js', category: 'Backend', level: 88 },
      { name: 'REST APIs', category: 'Backend', level: 88 },
    ] },
    { category: 'Database', items: [
      { name: 'MongoDB', category: 'Database', level: 85 }, { name: 'MongoDB Atlas', category: 'Database', level: 82 },
      { name: 'Supabase', category: 'Database', level: 74 },
    ] },
    { category: 'Tools & Deployment', items: [
      { name: 'Git & GitHub', category: 'Tools & Deployment', level: 90 }, { name: 'Vercel', category: 'Tools & Deployment', level: 82 },
      { name: 'Render', category: 'Tools & Deployment', level: 80 }, { name: 'Postman', category: 'Tools & Deployment', level: 84 },
    ] },
    { category: 'Other', items: [
      { name: 'MERN Stack Development', category: 'Other', level: 92 }, { name: 'WhatsApp Cloud API', category: 'Other', level: 80 },
      { name: 'Cloudinary', category: 'Other', level: 80 }, { name: 'Responsive Web Design', category: 'Other', level: 90 },
      { name: 'Admin Panel Development', category: 'Other', level: 88 }, { name: 'API Integration', category: 'Other', level: 87 },
    ] },
  ],
  projects: [],
  education: [
    {
      institution: 'CHARUSAT University', degree: 'B.Tech', field: 'Information Technology', startYear: 2023,
      endYear: 2027, currentSemester: '7th Semester', grade: '9.25 CGPA', gradeNote: 'Up to 6th semester',
    },
    {
      institution: 'Ashadeep Science Bhavan, Surat', degree: '12th (Higher Secondary, Science)',
      startYear: 2021, endYear: 2023, grade: '79.23%',
    },
  ],
  experience: [
    {
      role: 'Full Stack Web Development Intern',
      company: 'TechnoHacks Solutions',
      startDate: 'May 2025',
      endDate: 'Jun 2025',
      current: false,
      description: 'Built and maintained full-stack web applications using React.js, Next.js, and Node.js for production environments. Developed and integrated RESTful APIs connecting frontend interfaces with backend services and databases. Implemented authentication systems, managed MongoDB databases, and ensured code quality through reviews.',
      visible: true,
      order: 0,
    },
    {
      role: 'Full Stack Web Development Intern',
      company: 'DZ Infotech Bhavnagar, Gujarat, India (Remote)',
      startDate: 'May 2026',
      endDate: 'Present',
      current: true,
      description: 'Built and maintained full-stack MERN applications and developed RESTful APIs connecting frontend, backend, and databases. Independently handled deployment and testing, ensuring smooth releases and reliable application performance.',
      visible: true,
      order: 1,
    },
  ],
};
