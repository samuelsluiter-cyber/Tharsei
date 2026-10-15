module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        sand:      '#F8F4EB',
        paper:     '#F1EBDC',
        cream:     '#E9E1CF',
        sage:      '#8B9A78',
        'sage-dp': '#5D6C4E',
        forest:    '#333D2B',
        terra:     '#C0774E',
        'terra-dark': '#9C522D',
        'terra-sf':'#D89D79',
        ink:       '#2C2E26',
        muted:     '#6C6A5B',
      },
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft:  '0 18px 40px -22px rgba(51,61,43,0.35)',
        card:  '0 10px 30px -18px rgba(51,61,43,0.30)',
      },
    },
  },
  plugins: [],
};
