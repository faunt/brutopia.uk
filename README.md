# Brutopia - A True Island Paradise

An open call to play with Bruton's parallel reality: utopia vs. dystopia. Contribute a quip, drawing, joke, advert, song, or anything in between.

## Project Status

### 🎯 Content Development Checklist

#### Imagery Collection
- [ ] **Leo's picture** - Source and integrate portrait imagery
- [ ] **Greggs brand / sausage roll** - Obtain branded imagery or create satirical representation
- [ ] **Colour pic of a Ferrari / Lamborghini** - Source luxury car imagery for the "playground of the rich and famous" theme
- [ ] **Michelin stars** - Find or create imagery representing high-end dining
- [ ] **For Sale signs** - Source real estate signage imagery
- [ ] **Range Rovers** - Collect luxury SUV imagery to complement the car theme
- [ ] **Reference to worship** - Research and integrate Slavic mythology references from [Culture Frontier](https://www.culturefrontier.com/slavic-mythology/)
- [ ] **Montecito sign** - Source or recreate sign imagery from [eBay listing](https://www.ebay.co.uk/itm/156385163508)
- [ ] **Fancy food dishes** - Collect high-end restaurant imagery from:
  - [The Spruce Eats Guide](https://www.thespruceeats.com/ultimate-guide-to-making-fancy-restaurant-dishes-at-home-5095895)
  - [KimKim Luxury Dining Tour](https://www.kimkim.com/c/luxury-nature-fine-dining-tour-australia-10-days)
- [ ] **Locals go home cartoon** - Source cartoon imagery from [CartoonStock](https://www.cartoonstock.com/cartoon?searchID=CS252315)
- [ ] **House prices rise** - Find rising house prices graph imagery from [Dreamstime](https://www.dreamstime.com/stock-photos-house-prices-going-up-illustrated-graph-image27543453)
- [ ] **Moving van** - Source moving company imagery from [1st Formations](https://www.1stformations.co.uk/blog/move-company-from-another-country-to-the-uk/)
- [ ] **George Osborne** - Find rollercoaster imagery from [The Guardian](https://www.theguardian.com/commentisfree/picture/2015/mar/22/george-osborne-rollercoaster-riddell)
- [ ] **Golden dustbin** - Source luxury trash can imagery from [Shutterstock](https://www.shutterstock.com/image-illustration/gold-trash-can-58111018)

#### Text Content
- [ ] **Welcome to Brutopia** - Finalize opening message for the site
- [ ] **"Does Brutopia live up to the headlines... what's your Brutopia?"** - Integrate this key question into the site
- [ ] **"Bruton - Our home"** - Ensure this sentiment is properly expressed
- [ ] **"TAKING THE TEMPERATURE OF THE COMMUNITY"** - Develop this section concept
- [ ] **Medium diversity** - Determine if different mediums should be explicitly mentioned:
  - [ ] Sculpture
  - [ ] Painting
  - [ ] Film
  - [ ] Audio
  - [ ] Other formats

### 🛠️ Technical Tasks
- [ ] **Image optimization** - Ensure all new imagery is properly optimized using the existing `optimize-images.mjs` script
- [ ] **Responsive design** - Test all new imagery across different screen sizes
- [ ] **Accessibility** - Add proper alt text for all new imagery
- [ ] **Performance** - Optimize loading times for additional content
- [ ] **Email forwarding** - Review and configure email forwarding for @brutopia.uk addresses (submit@brutopia.uk, etc.)

### 📋 Content Integration
- [ ] **Review existing content** - Ensure new imagery and text complement the current site structure
- [ ] **Update parallax layers** - Integrate new imagery into the existing parallax system
- [ ] **Maintain visual consistency** - Ensure new content fits the "yellowed-magazine" aesthetic
- [ ] **Update meta descriptions** - Refresh SEO content if needed

## Project Structure

```
brutopia.uk/
├── index.html          # Main website file
├── img/               # Image assets (1242 files)
├── scripts/           # Build tools
│   ├── optimize-images.mjs
│   ├── upgrade-html.mjs
│   └── package.json
└── README.md          # This file
```

## Development

The project uses a simple HTML structure with:
- Custom CSS with a "yellowed-magazine" color palette
- Parallax scrolling effects
- Lightbox functionality for image viewing
- Responsive design principles

### Image Optimization
Run the optimization script to process new images:
```bash
cd scripts
node optimize-images.mjs
```

## Contributing

This is an open call project. Contributions can be submitted via email to `submit@brutopia.uk`.

## License

© 2024 Brutopia
