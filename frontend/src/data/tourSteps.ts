export interface TourStep {
  targetSelector: string;
  title: string;
  text: string;
}

export const tourSteps: TourStep[] = [
  { targetSelector: '#about .about-text', title: 'About me', text: 'A quick intro: who I am and what I build.' },
  { targetSelector: '#skills .skills-cards', title: 'My toolkit', text: 'React, Node, Express, MongoDB and more.' },
  { targetSelector: '#projects .projects-grid', title: "Things I've built", text: 'Real projects, from business sites to ERP systems.' },
  { targetSelector: '#education .cgpa-card', title: 'Education', text: 'B.Tech IT at CHARUSAT with a 9.25 CGPA.' },
  { targetSelector: '#contact .contact-form', title: "Let's talk", text: 'Have an idea or an opportunity? Get in touch.' },
];

export const guideImagePaths = [
  '/images/guide/01_top_left%20(1).png',
  '/images/guide/02_top_center%20(1).png',
  '/images/guide/03_top_right%20(1).png',
  '/images/guide/04_middle_left%20(1).png',
  '/images/guide/05_center%20(1).png',
  '/images/guide/06_middle_right%20(1).png',
  '/images/guide/07_bottom_left%20(1).png',
  '/images/guide/08_bottom_center%20(1).png',
  '/images/guide/09_bottom_right%20(1).png',
] as const;
