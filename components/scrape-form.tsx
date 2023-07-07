
'use client'
import { useState } from 'react';
import prisma from '@/lib/prisma'
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Transition } from '@headlessui/react'
import { Separator } from "@/components/ui/separator"

import { useForm, useFieldArray } from 'react-hook-form';
import styles from './scrape-form.module.css';


interface ElementPattern {
  [key: string]: string;
}

const data = z.record(z.string(), z.string());

const formSchema = z.object({
  url: z.string(),
  elementsPattern: z.array(
    z.object({
      key: z.string(),
      value: z.string()
    })
  )
});

export function ScrapeFrom() {

  const [scrapedData, setScrapedData] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      elementsPattern: [{ key: '', value: '' }]
    }
  });

  const { control, handleSubmit, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'elementsPattern'
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const { url, elementsPattern } = values;
    const filteredElementsPattern = elementsPattern.filter(
      (pattern) => pattern.key.trim() !== '' && pattern.value.trim() !== ''
    );

    const transformedElementsPattern = filteredElementsPattern.map((pattern) => {
      const { key, value } = pattern;
      return {
        [key]: value
      };
    });

    const transformedElementsPatternArray = [Object.assign({}, ...transformedElementsPattern)];
    console.log('Transformed elements pattern: ', transformedElementsPatternArray)

    console.log('Transformed elements pattern: ', transformedElementsPattern)

    await fetch('/api', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        elementsPattern: transformedElementsPatternArray
      }),
      next: { revalidate: 0 },
    }).then(res => res.json())
      .then(data => {
        console.log({ data })
        setScrapedData(data)
      })
  }

  const handleAddInput = () => {
    append({ key: '', value: '' });
  };

  const handleRemoveInput = (index: number) => {
    remove(index);
  };

  return (
    <div className='max-w-lg'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="vercel.com" {...field} />
                </FormControl>
                <FormDescription>
                  The URL you want to scrape
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="my-4" />
          <Transition
            show={true}
            enter="fade-in"
            enterFrom="opacity-0"
            enterTo="opacity-1"
            className="space-y-4"
          >

            {fields.map((field, index) => (
              <div key={field.id} className='max-w-lg'>
                <FormField
                  control={form.control}
                  {...form.register(`elementsPattern.${index}.key` as const)}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Name</FormLabel>
                      <FormControl>
                        <Input placeholder="recipe" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of the data pulled from the selector
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  {...form.register(`elementsPattern.${index}.value` as const)}
                  render={({ field }) => (
                    <FormItem className='my-4'>
                      <FormLabel>Selector</FormLabel>
                      <FormControl>
                        <Input placeholder="h2.heading-4" {...field} />
                      </FormControl>
                      <FormDescription>
                        The css selector for the data you want to scrape
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {index > 0 && (
                  <Button onClick={() => handleRemoveInput(index)} variant="destructive" className='mr-4'>
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </Transition>

          <div className='flex flex-col justify-start max-w-xl'>
            <Button onClick={handleAddInput} variant="secondary">
              Add Selector
            </Button>
            <Separator className="my-6" />
            <Button type="submit">Submit Scrape</Button>
          </div>
        </form>
      </Form>
      <Separator className="my-6" />
      <div className='max-w-sm'>
        <h2 className='text-2xl font-bold'>Scraped Data</h2>
        {JSON.stringify(scrapedData, null, 2)}
      </div>

    </div>
  )
}