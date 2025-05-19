import React from 'react';
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Testimonials = ({ testimonials = [] }) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            What Our Students Say
          </h2>

          <Carousel opts={{ align: "start" }} className="mx-auto w-full">
            <CarouselContent>
              {testimonials.map((testimonial) => {
                const user = testimonial.user || {};

                return (
                  <CarouselItem
                    key={testimonial.id}
                    className="md:basis-1/2 lg:basis-1/3 pl-4"
                  >
                    <div className="h-full rounded-xl border p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={user.profilePicture || "/placeholder.svg"}
                            alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
                            quality={50}
                          />
                          <AvatarFallback>
                            {(user.firstName?.charAt(0) || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.designation && (
                            <p className="text-sm text-gray-500">
                              {user.designation}
                            </p>
                          )}
                          <div className="flex">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < testimonial.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{testimonial.content}</p>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <div className="mt-8 flex justify-center gap-2">
              <CarouselPrevious className="relative inset-0 translate-y-0 text-secondary-foreground" />
              <CarouselNext className="relative inset-0 translate-y-0 text-secondary-foreground" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
