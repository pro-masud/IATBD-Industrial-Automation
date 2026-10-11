# IATBD Industrial Automation

A responsive, single-page website for IATBD, an industrial automation and motion-control service provider. The homepage presents servo drive services, technical capabilities, supported brands, customer feedback, and contact information.

## Features

- Responsive navigation with a mobile menu and service dropdown
- Hero slider with automatic rotation, previous/next controls, and slide indicators
- Light and dark themes with the selected theme saved in local storage
- Service, company overview, and supported-brand sections
- Animated service statistics and testimonial carousel
- Expandable FAQ section and contact call to action
- Dedicated contact page with dark/light themes and Contact Form 7-ready field styling
- Responsive layouts for mobile, tablet, and desktop screens

## Technology

- HTML, CSS, and vanilla JavaScript
- Tailwind CSS 4
- Font Awesome icons
- Google Fonts: Inter and Space Grotesk

## Getting Started

Install the project dependencies:

```bash
npm install
```

Build the production stylesheet:

```bash
npm run build
```

For development, rebuild the stylesheet automatically when source files change:

```bash
npm run watch
```

Open `index.html` or `contact.html` in a browser to view the site. The pages use externally hosted fonts, icons, and images, so an internet connection is required for those assets.

## WordPress Contact Form 7

The contact page includes a standalone form preview; it does not send messages on its own. In WordPress, create a Contact Form 7 form using this template:

```text
<label>Full name * [text* your-name autocomplete:name class:cf7-input placeholder "e.g. Rahim Uddin"]</label>
<label>Work email * [email* your-email autocomplete:email class:cf7-input placeholder "you@company.com"]</label>
<label>Phone number [tel your-phone autocomplete:tel class:cf7-input placeholder "+880 1XXX-XXXXXX"]</label>
<label>Service you need
[select your-service first_as_label class:cf7-input "Choose a service" "PLC programming & troubleshooting" "HMI design & support" "VFD installation & repair" "Servo drive & motor service" "Industrial automation products" "Other enquiry"]</label>
<label>Message * [textarea* your-message class:cf7-input placeholder "Tell us about the equipment, issue, or project..."]</label>
[submit class:cf7-submit "Send message"]
```

Then replace the preview `<form>` in `contact.html` with the shortcode shown by the plugin, for example:

```text
[contact-form-7 id="123" title="Contact form"]
```

Load the built stylesheet (`dist/output.css`, which includes `src/custom.css`) on the WordPress contact page so the `cf7-input` and `cf7-submit` styles apply. Update the example shortcode ID and the placeholder phone/WhatsApp details with your real business contact information.

## Project Structure

```text
.
├── index.html          # Homepage markup, interactions, and page-specific styles
├── src/
│   └── input.css       # Tailwind entry point and theme configuration
├── dist/
│   └── output.css      # Generated stylesheet used by the homepage
├── package.json        # Dependencies and build scripts
└── README.md
```

## Build Check

Run `npm run build` to verify that Tailwind can generate the stylesheet. No automated test suite is currently configured.
