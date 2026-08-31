/**
 * Centralized SEO JSON-LD Structured Data Schemas
 * Compliant with Schema.org & Google Search Rich Results guidelines.
 */

export const BASE_URL = "https://www.petalsandwords.com";

/**
 * Root Organization & WebSite schema for sitelinks, knowledge panel, and brand entity
 */
export function getOrganizationAndWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        "name": "Petals & Words",
        "url": BASE_URL,
        "logo": {
          "@type": "ImageObject",
          "@id": `${BASE_URL}/#logo`,
          "url": `${BASE_URL}/logo-transparent.png`,
          "caption": "Petals & Words Logo",
          "width": 512,
          "height": 512
        },
        "image": `${BASE_URL}/logo-transparent.png`,
        "description": "Send animated digital flower bouquets, 3D interactive cakes, virtual greeting cards, and heartfelt gifts with personalized notes.",
        "sameAs": [
          "https://www.instagram.com/petalsandwords",
          "https://twitter.com/petalsandwords"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Support",
          "url": `${BASE_URL}/create`,
          "availableLanguage": ["English", "Hindi", "Spanish", "French", "German", "Japanese"]
        }
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        "url": BASE_URL,
        "name": "Petals & Words",
        "description": "Create and send thoughtful digital bouquets, virtual greeting cards, and interactive gifts with personal notes.",
        "publisher": {
          "@id": `${BASE_URL}/#organization`
        },
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}/create?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };
}

/**
 * Main Homepage Schema: WebApplication + FAQPage + BreadcrumbList + ItemList (Featured Gift Builders)
 */
export function getHomepageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/#webpage`,
        "url": BASE_URL,
        "name": "Free Online Bouquet Maker | Create & Send Digital Flowers with a Note",
        "description": "Send a digital bouquet for birthdays, anniversaries, apologies, or just because. Free, instant, no signup required.",
        "inLanguage": "en-US",
        "isPartOf": { "@id": `${BASE_URL}/#website` }
      },
      {
        "@type": "WebApplication",
        "@id": `${BASE_URL}/#app`,
        "name": "Petals & Words Digital Gift Maker",
        "url": BASE_URL,
        "applicationCategory": "LifestyleApplication",
        "operatingSystem": "All (Web, iOS, Android, Windows, macOS)",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1420",
          "bestRating": "5",
          "worstRating": "1"
        },
        "creator": { "@id": `${BASE_URL}/#organization` }
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE_URL}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I create and send a digital bouquet?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Go to the /create builder, select your favorite flower stems (roses, lilies, tulips, sunflowers), type a heartfelt note or use the AI Note Writer, choose optional background music, and click Share to generate a unique link to send via WhatsApp, SMS, or social media."
            }
          },
          {
            "@type": "Question",
            "name": "Is Petals & Words free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! You can design, customize, and preview your digital flower bouquets, 3D cakes, hug cards, and greeting cards completely free without signing up."
            }
          },
          {
            "@type": "Question",
            "name": "How does the recipient open their digital bouquet or gift?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "When the recipient clicks your link on their phone or computer, they experience an animated reveal: blooming flowers, blowing out interactive 3D birthday candles, or unfolding a personalized note with ambient background music."
            }
          },
          {
            "@type": "Question",
            "name": "Can I add music and a personal message to my bouquet?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. You can write any custom personal message and choose from relaxing background soundtracks like Gentle Guitar, Sweet Piano, Lofi Vibe, or Cute Chiptune."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to download an app or register an account?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No app download or account registration is needed. Petals & Words works seamlessly directly in any modern mobile or desktop web browser."
            }
          }
        ]
      },
      {
        "@type": "ItemList",
        "name": "Popular Virtual Gift Makers",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Digital Flower Bouquet Maker",
            "url": `${BASE_URL}/create`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "3D Interactive Birthday Cake",
            "url": `${BASE_URL}/create-cake`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Virtual Greeting Card Maker",
            "url": `${BASE_URL}/create-greeting-card`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "Send a Virtual Hug Card",
            "url": `${BASE_URL}/create-hug-card`
          },
          {
            "@type": "ListItem",
            "position": 5,
            "name": "Adopt a Virtual Pet Gift",
            "url": `${BASE_URL}/create-pet`
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": BASE_URL
          }
        ]
      }
    ]
  };
}

/**
 * Bouquet Builder Schema (for /create and /virtual-bouquet-maker)
 */
export function getBouquetMakerSchema(path = "/create") {
  const url = `${BASE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": "Create a Free Digital Bouquet | Pick Flowers & Add a Note",
        "description": "Build a custom digital bouquet with roses, tulips, sunflowers, and more. Write a personal note and share instantly.",
        "isPartOf": { "@id": `${BASE_URL}/#website` }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Virtual Flower Bouquet Maker",
        "url": url,
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All (Web Browser)",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "890"
        }
      },
      {
        "@type": "HowTo",
        "name": "How to Create and Send a Digital Bouquet Online",
        "description": "Step-by-step guide to assembling and sharing a custom virtual flower bouquet.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Pick Your Flowers",
            "text": "Select from fresh stems like roses, lilies, tulips, jasmine, and sunflowers on the canvas."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Write Your Note",
            "text": "Craft a heartfelt personal message or generate one with the AI Note Assistant."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Choose Background Music",
            "text": "Select an ambient melody such as gentle acoustic guitar or soft piano."
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Share Instantly",
            "text": "Send the generated interactive link via WhatsApp, iMessage, SMS, or social media."
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": BASE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Create Bouquet",
            "item": url
          }
        ]
      }
    ]
  };
}

/**
 * 3D Birthday Cake Maker Schema (/create-cake)
 */
export function getCakeMakerSchema() {
  const url = `${BASE_URL}/create-cake`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": "Virtual Birthday Cake Maker | Interactive 3D Cake with Candles",
        "description": "Create an interactive 3D birthday cake with blow-out candles. Customize flavors and share instantly.",
        "isPartOf": { "@id": `${BASE_URL}/#website` }
      },
      {
        "@type": "SoftwareApplication",
        "name": "3D Virtual Birthday Cake Maker",
        "url": url,
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All (Web Browser)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Create 3D Cake", "item": url }
        ]
      }
    ]
  };
}

/**
 * Greeting Card Maker Schema (/create-greeting-card)
 */
export function getGreetingCardSchema() {
  const url = `${BASE_URL}/create-greeting-card`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": "Free Digital Greeting Card Maker | Create & Send Online",
        "description": "Create stunning interactive greeting cards with envelope reveal animation. Free, instant, beautiful on any device.",
        "isPartOf": { "@id": `${BASE_URL}/#website` }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Interactive Digital Greeting Card Maker",
        "url": url,
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All (Web Browser)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Create Greeting Card", "item": url }
        ]
      }
    ]
  };
}

/**
 * Virtual Hug Card Schema (/create-hug-card)
 */
export function getHugCardSchema() {
  const url = `${BASE_URL}/create-hug-card`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": "Send a Virtual Hug | Interactive Digital Hug Card",
        "description": "Send a warm digital hug with sweet animations and a heartfelt note.",
        "isPartOf": { "@id": `${BASE_URL}/#website` }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Virtual Hug Card Maker",
        "url": url,
        "applicationCategory": "LifestyleApplication",
        "operatingSystem": "All (Web Browser)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Send Virtual Hug", "item": url }
        ]
      }
    ]
  };
}
