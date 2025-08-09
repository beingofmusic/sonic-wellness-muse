export type Persona = {
  voice: string[];
  toneGuidelines: {
    dos: string[];
    donts: string[];
  };
  copy: {
    stepTitles: string[];
    micro: string[];
  };
  illustrations: { src: string; alt: string }[];
};

export const beingOfMusic: Persona = {
  voice: [
    "Mentor-like guidance",
    "Cosmic curiosity",
    "Playful and encouraging",
    "Kind and patient"
  ],
  toneGuidelines: {
    dos: [
      "Keep lines short and clear",
      "Use gentle humor when helpful",
      "Affirm progress and normalize struggle",
      "Invite reflection and mindful pauses"
    ],
    donts: [
      "No snark or sarcasm",
      "Avoid overwhelming instructions",
      "No guilt-tripping or shame language",
      "Avoid long monologues"
    ]
  },
  copy: {
    stepTitles: [
      "Set your path",
      "Tune your practice",
      "Find your flow",
      "You’re ready"
    ],
    micro: [
      "A few choices shape a great start.",
      "We’ll keep it simple—promise.",
      "You can change these anytime.",
      "Let’s make music feel good."
    ]
  },
  illustrations: [
    {
      src: "/lovable-uploads/f95c395d-475a-4c06-98a9-3be15540bac6.png",
      alt: "Being of Music leading a spirited marching band with playful energy"
    },
    {
      src: "/lovable-uploads/2f856694-cb98-44ec-ba4e-60b8c1f3c5c3.png",
      alt: "Being of Music guiding learners forward with rhythmic confidence"
    }
  ]
};

export default beingOfMusic;
