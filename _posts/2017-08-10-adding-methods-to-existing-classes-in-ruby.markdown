---
layout: post
title:  "Adding Methods to Existing Classes in Ruby"
date:   2017-08-10 11:45:00 -0400
categories: Ruby
---
Ever wonder why some classes have methods that only work when a certain library is "required"?
{% highlight ruby %}
> {:foo => "bar"}.to_json
NoMethodError: undefined method `to_json` for {:foo=>"bar"}:Hash
> require 'json'
true
> {:foo => "bar"}.to_json
"{\"foo\":\"bar\"}"
{% endhighlight %}
The `Hash` class didn't have the `to_json` method until we "required" the json library. How come?

In Ruby, all classes are open. That means you can add or change methods for a class on the fly, even for existing classes.
For example, let's add a method to the `String` class that rearranges the letters in alphabetical order. Why you would want to do this is anyone's guess, but it'll look funny, that's for sure:
{% highlight ruby %}
class String
  def alphabetize
    self.downcase.chars.keep_if{|c| ('a' .. 'z').include? c}.sort.join # Only use characters "a" through "z" to keep it simple
  end
end

'You know nothing, Jon Snow'.alphabetize  # => "ghijknnnnnooooostuwwy"
{% endhighlight %}

It looks like we're defining the `String` class here, but since it's already defined, we're only adding the `alphabetize` method to it.
All other functionality of the class stays the same. This is how the json library adds `to_json` methods to all the different classes that it supports.

This sort of approach is much more natural that providing a utility class that accepts existing classes as input and output. For example:
{% highlight ruby %}
MyTextUtils.alphabetize 'You know nothing, Jon Snow'  # => "ghijknnnnnooooostuwwy"
{% endhighlight %}

While it's clear that we're using custom functionality to output the alphabetized text, the actor here should be the original String itself, not some other class.
That's why Strings have other methods like `downcase`, `reverse`, `split`, etc.
