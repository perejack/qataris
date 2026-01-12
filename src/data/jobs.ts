import { Job } from "@/components/jobs/JobCard";

// Import all job images
import babysitterImg from "@/assets/jobs/babysitter.jpg";
import bartenderImg from "@/assets/jobs/bartender.jpg";
import caretakerImg from "@/assets/jobs/caretaker.jpg";
import casinoWorkerImg from "@/assets/jobs/casino-worker.jpg";
import chefImg from "@/assets/jobs/chef.jpg";
import driverImg from "@/assets/jobs/driver.jpg";
import dryCleaningImg from "@/assets/jobs/dry-cleaning.jpg";
import electricianImg from "@/assets/jobs/electrician.jpg";
import fishPlantImg from "@/assets/jobs/fish-plant.jpg";
import gardenerImg from "@/assets/jobs/gardener.jpg";
import hostessImg from "@/assets/jobs/hostess.jpg";
import frontDeskImg from "@/assets/jobs/front-desk.jpg";
import valetImg from "@/assets/jobs/valet.jpg";
import housekeeperImg from "@/assets/jobs/housekeeper.jpg";
import housekeepingStaffImg from "@/assets/jobs/housekeeping-staff.jpg";
import janitorImg from "@/assets/jobs/janitor.jpg";
import kitchenHelperImg from "@/assets/jobs/kitchen-helper.jpg";
import lightCleanerImg from "@/assets/jobs/light-cleaner.jpg";
import machineOperatorImg from "@/assets/jobs/machine-operator.jpg";
import nannyImg from "@/assets/jobs/nanny.jpg";
import parentHelperImg from "@/assets/jobs/parent-helper.jpg";
import plumberImg from "@/assets/jobs/plumber.jpg";
import receptionistImg from "@/assets/jobs/receptionist.jpg";
import secretaryImg from "@/assets/jobs/secretary.jpg";
import securityGuardImg from "@/assets/jobs/security-guard.jpg";
import specializedCleanerImg from "@/assets/jobs/specialized-cleaner.jpg";
import storeKeeperImg from "@/assets/jobs/store-keeper.jpg";
import welderImg from "@/assets/jobs/welder.jpg";

export const jobsData: Job[] = [
  {
    id: "1",
    title: "Babysitter",
    company: "Bright Horizons",
    category: "Childcare",
    type: "Part-time",
    salary: "$2,500 - $4,333",
    description: "Care for children in private homes. Flexible work with competitive compensation.",
    keyRoles: [
      "Supervise children during daily activities",
      "Prepare meals and snacks",
      "Assist with homework and educational activities",
    ],
    image: babysitterImg,
  },
  {
    id: "2",
    title: "Bartender",
    company: "Boston Pizza",
    category: "Hospitality",
    type: "Part-time",
    salary: "Up to $4,333 (including tips)",
    description: "Mix drinks and serve patrons in vibrant settings. Enjoy tips and competitive earnings.",
    keyRoles: [
      "Mix and serve alcoholic and non-alcoholic beverages",
      "Take orders and process payments",
      "Maintain bar cleanliness and inventory",
    ],
    image: bartenderImg,
  },
  {
    id: "3",
    title: "Caretaker & Building Superintendent",
    company: "Canadian Tire",
    category: "Maintenance",
    type: "Full-time",
    salary: "$3,033 - $4,000",
    description: "Ensure facilities are clean and well-maintained. Enjoy stable employment with varied responsibilities.",
    keyRoles: [
      "Perform routine building maintenance and repairs",
      "Monitor security systems and property",
      "Handle tenant requests and emergencies",
    ],
    image: caretakerImg,
  },
  {
    id: "4",
    title: "Casino Worker",
    company: "Great Northern Casino",
    category: "Entertainment",
    type: "Full-time",
    salary: "Varies widely (min wage + tips)",
    description: "Join Qatar's exciting gaming industry. Various positions available with competitive base pay plus tips.",
    keyRoles: [
      "Operate gaming equipment and assist players",
      "Process transactions and handle cash",
      "Ensure compliance with gaming regulations",
    ],
    image: casinoWorkerImg,
  },
  {
    id: "5",
    title: "Chef",
    company: "Four Seasons Hotels",
    category: "Culinary",
    type: "Full-time",
    salary: "$3,120 - $5,200",
    description: "Showcase your culinary talents in a vibrant kitchen environment. Create delicious dishes with growth opportunities.",
    keyRoles: [
      "Prepare and cook menu items to quality standards",
      "Manage kitchen inventory and food costs",
      "Train and supervise kitchen staff",
    ],
    image: chefImg,
  },
  {
    id: "6",
    title: "Driver",
    company: "Uber Qatar",
    category: "Transportation",
    type: "Full-time",
    salary: "$2,500 - $4,333",
    description: "Transport people and goods across Qatar. Various driving positions with competitive pay.",
    keyRoles: [
      "Transport passengers or goods safely and efficiently",
      "Maintain vehicle cleanliness and perform basic checks",
      "Navigate routes and manage delivery schedules",
    ],
    image: driverImg,
  },
  {
    id: "7",
    title: "Dry Cleaning Worker",
    company: "Maple Cleaners",
    category: "Service",
    type: "Full-time",
    salary: "Up to $3,466",
    description: "Help keep clothes fresh and clean in a fast-paced environment. Provide quality service.",
    keyRoles: [
      "Process garments through cleaning equipment",
      "Inspect items for stains and damage",
      "Provide customer service and handle transactions",
    ],
    image: dryCleaningImg,
  },
  {
    id: "8",
    title: "Electrician",
    company: "Home Depot Qatar",
    category: "Skilled Trades",
    type: "Full-time",
    salary: "$5,200 - $6,933",
    description: "Join Qatar's skilled trades sector. High-demand profession with excellent compensation.",
    keyRoles: [
      "Install and maintain electrical systems",
      "Troubleshoot electrical problems and repairs",
      "Ensure compliance with electrical codes and safety",
    ],
    image: electricianImg,
  },
  {
    id: "9",
    title: "Fish Plant Worker",
    company: "Atlantic Seafood Co.",
    category: "Manufacturing",
    type: "Full-time",
    salary: "$3,033 - $4,333",
    description: "Contribute to the seafood industry by processing high-quality fish products.",
    keyRoles: [
      "Process and package seafood products",
      "Operate processing equipment safely",
      "Maintain quality control and food safety standards",
    ],
    image: fishPlantImg,
  },
  {
    id: "10",
    title: "Gardener",
    company: "Northern Landscapes",
    category: "Landscaping",
    type: "Full-time",
    salary: "$2,600 - $3,466",
    description: "Cultivate beautiful landscapes and nurture plants in a rewarding outdoor role.",
    keyRoles: [
      "Plant, water, and maintain gardens and landscapes",
      "Operate lawn care equipment and tools",
      "Design and implement landscaping projects",
    ],
    image: gardenerImg,
  },
  {
    id: "11",
    title: "Hostess",
    company: "Tim Hortons",
    category: "Hospitality",
    type: "Part-time",
    salary: "Min wage to $3,120 (plus tips)",
    description: "Welcome guests in Qatar's hospitality sector. Entry-level positions with earning potential.",
    keyRoles: [
      "Greet and seat guests in restaurant",
      "Manage reservations and waiting lists",
      "Coordinate with kitchen and serving staff",
    ],
    image: hostessImg,
  },
  {
    id: "12",
    title: "Hotel Front Desk Clerk",
    company: "Marriott Hotels",
    category: "Hospitality",
    type: "Full-time",
    salary: "$2,840 - $3,773",
    description: "Be the first point of contact for guests, providing exceptional service and support.",
    keyRoles: [
      "Check guests in and out of hotel",
      "Handle reservations and room assignments",
      "Resolve guest complaints and requests",
    ],
    image: frontDeskImg,
  },
  {
    id: "13",
    title: "Hotel Valet",
    company: "Hilton Hotels",
    category: "Hospitality",
    type: "Part-time",
    salary: "Min wage to $3,120 (plus tips)",
    description: "Provide premium service at Qatar hotels. Entry-level position with tip earning potential.",
    keyRoles: [
      "Park and retrieve guest vehicles",
      "Provide luggage assistance and directions",
      "Maintain professional appearance and service",
    ],
    image: valetImg,
  },
  {
    id: "14",
    title: "Housekeeper",
    company: "Molly Maid",
    category: "Cleaning",
    type: "Part-time",
    salary: "$2,600 - $2,960",
    description: "Create inviting spaces for guests and residents. Enjoy flexible hours.",
    keyRoles: [
      "Clean and maintain guest rooms and common areas",
      "Change linens and restock amenities",
      "Report maintenance issues and damages",
    ],
    image: housekeeperImg,
  },
  {
    id: "15",
    title: "Housekeeping Staff",
    company: "Best Western Hotels",
    category: "Cleaning",
    type: "Full-time",
    salary: "Up to $3,120",
    description: "Join our professional housekeeping team. Flexible schedules and advancement opportunities.",
    keyRoles: [
      "Perform deep cleaning of hotel facilities",
      "Coordinate with housekeeping team",
      "Maintain inventory of cleaning supplies",
    ],
    image: housekeepingStaffImg,
  },
  {
    id: "16",
    title: "Janitor & Building Superintendent",
    company: "Canadian Properties",
    category: "Maintenance",
    type: "Full-time",
    salary: "$3,033 - $4,000",
    description: "Ensure facilities are clean and well-maintained. Stable employment with varied responsibilities.",
    keyRoles: [
      "Maintain cleanliness of buildings and facilities",
      "Perform minor repairs and maintenance",
      "Monitor security and safety protocols",
    ],
    image: janitorImg,
  },
  {
    id: "17",
    title: "Kitchen Helper",
    company: "McDonald's Qatar",
    category: "Culinary",
    type: "Part-time",
    salary: "$2,600 - $2,960",
    description: "Support the kitchen team by preparing ingredients and maintaining cleanliness.",
    keyRoles: [
      "Food safety knowledge",
      "Team work",
      "Physical stamina",
    ],
    image: kitchenHelperImg,
  },
  {
    id: "18",
    title: "Light Duty Cleaner",
    company: "Clean Pro Services",
    category: "Cleaning",
    type: "Part-time",
    salary: "Up to $3,120",
    description: "Help maintain cleanliness in various settings with flexible hours.",
    keyRoles: [
      "Attention to detail",
      "Reliability",
      "Basic cleaning skills",
    ],
    image: lightCleanerImg,
  },
  {
    id: "19",
    title: "Machine Operator",
    company: "Bombardier Inc.",
    category: "Manufacturing",
    type: "Full-time",
    salary: "Min wage to $4,333",
    description: "Operate equipment in Qatar manufacturing. Technical role with competitive compensation.",
    keyRoles: [
      "Technical aptitude",
      "Safety training",
      "Attention to detail",
    ],
    image: machineOperatorImg,
  },
  {
    id: "20",
    title: "Nanny",
    company: "Bright Horizons",
    category: "Childcare",
    type: "Full-time",
    salary: "$2,600 - $4,333",
    description: "Make a lasting impact on children's lives by providing care and guidance.",
    keyRoles: [
      "Childcare experience",
      "First aid certification",
      "Background check",
    ],
    image: nannyImg,
  },
  {
    id: "21",
    title: "Parent's Helper",
    company: "Family Care Plus",
    category: "Childcare",
    type: "Part-time",
    salary: "Min wage to $4,333",
    description: "Support families with childcare and household duties. Entry-level caregiving position.",
    keyRoles: [
      "Childcare interest",
      "Reliability",
      "Flexible schedule",
    ],
    image: parentHelperImg,
  },
  {
    id: "22",
    title: "Plumber",
    company: "Lowe's Qatar",
    category: "Skilled Trades",
    type: "Full-time",
    salary: "$5,200 - $6,933",
    description: "Join the essential trade of plumbing. High demand for your skills with competitive pay.",
    keyRoles: [
      "Plumbing certification",
      "2+ years experience",
      "Valid license",
    ],
    image: plumberImg,
  },
  {
    id: "23",
    title: "Receptionist",
    company: "Professional Services Inc.",
    category: "Administrative",
    type: "Full-time",
    salary: "Min wage to $3,786",
    description: "Support Qatar businesses in administrative roles. Professional environment with benefits.",
    keyRoles: [
      "Communication skills",
      "Computer proficiency",
      "Professional demeanor",
    ],
    image: receptionistImg,
  },
  {
    id: "24",
    title: "Secretary",
    company: "Corporate Solutions",
    category: "Administrative",
    type: "Full-time",
    salary: "Min wage to $3,786",
    description: "Provide administrative support in professional environments. Career advancement opportunities.",
    keyRoles: [
      "Administrative experience",
      "Computer skills",
      "Organization skills",
    ],
    image: secretaryImg,
  },
  {
    id: "25",
    title: "Security Guard",
    company: "Garda Security",
    category: "Security",
    type: "Full-time",
    salary: "$2,773 - $3,466",
    description: "Protect people and property while ensuring safety in diverse environments.",
    keyRoles: [
      "Security license",
      "Physical fitness",
      "Alert mindset",
    ],
    image: securityGuardImg,
  },
  {
    id: "26",
    title: "Specialized Cleaner",
    company: "Elite Cleaning Services",
    category: "Cleaning",
    type: "Full-time",
    salary: "Up to $4,333",
    description: "Use your skills to tackle unique cleaning challenges in specialized environments.",
    keyRoles: [
      "Specialized cleaning training",
      "Attention to detail",
      "Safety protocols",
    ],
    image: specializedCleanerImg,
  },
  {
    id: "27",
    title: "Store Keeper",
    company: "Loblaws",
    category: "Retail",
    type: "Full-time",
    salary: "Min wage to $3,466",
    description: "Manage inventory and operations in retail settings. Various positions available.",
    keyRoles: [
      "Inventory management",
      "Customer service",
      "Organization skills",
    ],
    image: storeKeeperImg,
  },
  {
    id: "28",
    title: "Welder",
    company: "Qatar Steel Works",
    category: "Skilled Trades",
    type: "Full-time",
    salary: "$4,333 - $6,066",
    description: "Join the skilled trades and help shape the future with your welding expertise.",
    keyRoles: [
      "Welding certification",
      "Safety training",
      "2+ years experience",
    ],
    image: welderImg,
  },
];
