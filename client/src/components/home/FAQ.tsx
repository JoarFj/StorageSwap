import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How does StoreShare ensure my items are safe?",
    answer: "All hosts go through a verification process, and we offer a $10,000 protection guarantee for your stored items. We recommend that both parties document the condition of items upon drop-off. Additionally, our platform lets you message directly with hosts about any specific security concerns."
  },
  {
    question: "What types of items can I store?",
    answer: "You can store most household items, furniture, seasonal decorations, sporting equipment, and more. However, perishable goods, hazardous materials, illegal items, and animals are prohibited. Each host may also have their own restrictions, which will be listed on their space profile."
  },
  {
    question: "How much does it cost to list my space?",
    answer: "Listing your space is completely free. StoreShare only takes a 15% service fee when you successfully rent out your space. You set your own prices and can adjust them anytime to maximize your earnings."
  },
  {
    question: "How do I access my stored items?",
    answer: "Access policies vary by host and are clearly stated on each listing. Some spaces offer 24/7 access, while others may have specific hours or require advance notice. You can message your host through our platform to arrange access to your items."
  }
];

export default function FAQ() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-sans font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about StoreShare</p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-gray-200 rounded-lg px-0"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline font-sans font-medium text-gray-800">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <Button>
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
}
