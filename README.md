# American Roulette Game

A fully functional web-based American Roulette game built with vanilla JavaScript. Features include animated wheel spins, standard betting patterns, sound effects, bet history tracking, and balance persistence.

## Features

- **American Roulette**: Full 38-number wheel (0, 00, 1-36)
- **Standard Betting**: All standard bet types including straight up, splits, streets, corners, lines, dozens, columns, and outside bets
- **Animated Wheel**: Smooth CSS-based wheel animation with ball physics
- **Sound Effects**: Audio feedback for spins, wins, and chip placements
- **Bet History**: Track all previous spins with statistics
- **Balance Persistence**: Your balance is saved between sessions using localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **No Build Tools**: Pure HTML/CSS/JavaScript - runs directly in any modern browser

## Quick Start

1. **Open the game**:
   ```bash
   cd /Users/lamar/Software/roulette
   ```

2. **Start a local server** (choose one):
   ```bash
   # Python 3
   python3 -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000

   # Node.js (if you have http-server installed)
   npx http-server -p 8000

   # PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000`

## Sound Files

The game is configured to use sound effects, but placeholder audio files need to be added:

**Required files:**
- `assets/sounds/chip.mp3` - Chip placement sound
- `assets/sounds/spin.mp3` - Wheel spinning sound
- `assets/sounds/win.mp3` - Winning sound
- `assets/sounds/lose.mp3` - Losing sound

**To add sound files:**
1. Find or create short MP3 audio files for each sound
2. Place them in the `assets/sounds/` directory with the exact names above
3. The game will automatically play them (if sound is enabled)

**Note:** The game will work perfectly without sound files - it just won't have audio feedback.

## How to Play

1. **Select a Chip**: Click on a chip denomination ($1, $5, $10, $25, $100, $500)
2. **Place Bets**: Click on the betting table to place bets
   - Click number centers for straight bets (35:1)
   - Click outside areas for even-money bets (red/black, even/odd, high/low)
   - Click dozen/column areas for 2:1 bets
3. **Spin**: Click the "Spin" button to spin the wheel
4. **Collect Winnings**: If you win, your balance updates automatically
5. **Repeat**: Place more bets and spin again!

## Betting Options

### Inside Bets
- **Straight Up** (35:1): Single number
- **Split** (17:1): Two adjacent numbers
- **Street** (11:1): Three numbers in a row
- **Corner** (8:1): Four numbers in a square
- **Line** (5:1): Six numbers across two rows

### Outside Bets
- **Dozen** (2:1): First 12, Second 12, or Third 12
- **Column** (2:1): One of three vertical columns
- **Red/Black** (1:1): All red or all black numbers
- **Even/Odd** (1:1): All even or odd numbers
- **Low/High** (1:1): 1-18 or 19-36

## Controls

- **Spin**: Start the wheel spin (requires at least one bet)
- **Clear Bets**: Remove all current bets
- **Undo**: Remove the last bet placed
- **Double**: Double all current bets
- **Repeat**: Repeat bets from the last spin
- **Sound Toggle**: Enable/disable sound effects
- **Settings**: Access game settings
- **History**: View spin history and statistics

## Game Rules

- **Starting Balance**: $1,000
- **Minimum Bet**: $1 per bet
- **Maximum Bet**: $1,000 per bet
- **Table Maximum**: $10,000 total per spin
- **House Edge**: 5.26% (standard for American Roulette)

## Technical Details

### File Structure
```
roulette/
├── index.html                          # Main HTML
├── css/
│   ├── main.css                        # Layout & global styles
│   ├── wheel.css                       # Wheel animations
│   ├── table.css                       # Betting table
│   └── ui.css                          # UI components
├── js/
│   ├── config/
│   │   └── roulette-config.js         # Game configuration
│   ├── core/
│   │   ├── game-state.js              # State management
│   │   ├── bet-manager.js             # Bet handling
│   │   └── payout-calculator.js       # Payout logic
│   ├── components/
│   │   ├── betting-table.js           # Table UI
│   │   ├── chip-selector.js           # Chip selection
│   │   ├── wheel.js                   # Wheel animation
│   │   └── bet-history.js             # History display
│   ├── utils/
│   │   ├── storage.js                 # localStorage wrapper
│   │   ├── audio.js                   # Sound management
│   │   └── helpers.js                 # Utility functions
│   └── main.js                        # App initialization
├── assets/
│   └── sounds/                        # Sound effects (to be added)
└── README.md                          # This file
```

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome mobile)

### LocalStorage Usage
The game stores the following in localStorage:
- `roulette-balance`: Current balance
- `roulette-history`: Last 50 spins
- `roulette-settings`: Sound and animation settings

## Customization

### Change Starting Balance
Edit `js/config/roulette-config.js`:
```javascript
defaultBalance: 1000  // Change to desired amount
```

### Change Bet Limits
Edit `js/config/roulette-config.js`:
```javascript
limits: {
  minBet: 1,
  maxBet: 1000,
  tableMax: 10000
}
```

### Change Animation Speed
Edit `js/config/roulette-config.js`:
```javascript
animation: {
  spinDuration: 4000,  // milliseconds
  minRevolutions: 5,
  maxRevolutions: 8
}
```

### Change Chip Denominations
Edit `js/config/roulette-config.js`:
```javascript
chipDenominations: [1, 5, 10, 25, 100, 500]
```

## Deployment

### GitHub Pages
1. Create a GitHub repository
2. Push this code to the repository
3. Go to Settings → Pages
4. Select main branch as source
5. Your game will be available at `https://yourusername.github.io/roulette`

### Netlify
1. Drag and drop the folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your game will be instantly deployed

### Vercel
```bash
npm i -g vercel
vercel
```

## Troubleshooting

**Game doesn't load:**
- Make sure you're running a local server (not opening index.html directly)
- Check browser console for errors

**Sounds don't play:**
- Add MP3 files to `assets/sounds/`
- Check that sound is enabled in settings
- Some browsers block autoplay - click somewhere on the page first

**Balance resets:**
- localStorage might be disabled in your browser
- Check browser privacy settings

**Wheel animation stutters:**
- Try reducing animation speed in settings
- Close other tabs/applications

## License

This is a personal entertainment project. Feel free to modify and use as you wish.

## Credits

Built with vanilla JavaScript, CSS Grid, and CSS animations. No frameworks or build tools required.

---

**Enjoy the game! Remember to gamble responsibly.** 🎰
