# Open tickets

## Regression

I can ping myself, yay!

I'm not fixing it, but I think it's because we don't to .toLowerCase on `author` param.

\- xh

___

`<blockquote>` CSS!!!!!!

for markdown

\- xh

## FOUT

I don't know what it is, maybe it's our server sending the pages too slow, maybe it's caching, but I always see the fonts swap out slowly.

\- xh

> Am testing (using DevTools) on a lower-grade connection now
>
> It's just the font stylesheet taking a while to load from google fonts. 40ms to load:
>
> DOM takes 297ms to load, gfonts stylesheet loads after 461ms including what came before it. (Whole page is 702ms)
>
> See [load.png](#load.png)
>
> \- Winters
>
>

> Yeah, that's what's confusing me; our page loads pretty dang fast, but why is the Google font loading so much later?

> Oh... I know what we didn't do ;-;
> Time to set up server-side caching and cache expirations; this is gonna be painful

## NoScript

I fixed some aspects of the noscript experience, still needs some work though.

Tell me if I've missed any scripted pages.

\- Winters

> I'm pretty sure the noscript experience should be great, we're using server-side templating and post messages
>
> \- xh
>
> > Profile page would appear blank because we use scripts to unhide the sections, and the login button wouldn't work
> >
> > \- Winters

## Notifications

I've added a basic notification system, people can now @ each other.
It's awful

\- Winters

> lmao; I'm done with the code, I don't know about you
>
> \- xh
>
> > I'm done too
> >
> > \- Winters

## Moderators deleting Moderator answers

All EpicGamer007's change at public/views/question.ejs:48 does is *hide* the button, moderators can still POST to /delete and delete another moderator's answer. Also, why do we even need this?

\- Winters

> lmao, deleting eachother's messages is still possible
> Ugh, I guess we'll need to 403 them if they're a mod and it's a mod question/answer
>
> - xh

## WOW!!!!

[LOOK AT OUR LIGHTHOUSE SCORE! :)](#hacktalk-home-lighthouse.png)

\- Winters

> a) I added your `- winters` to the end of this
> b) we should check our WebAim score :)
> c) that score is bs
> d) we did a good job
>
> - xh

# temporary discussion #

```cpp

// this is sort-of c++, not valid iso c++

// assume size is a multiple of 9
// if block is 256, we'll make SIZE 252 OR SIZE is 288 and data is 256 long
byte* memchunk = new byte[SIZE];
byte* data = byte + (SIZE / 9);
byte* index = memchunk; // for clarity

extern bool getBit(byte src, byte bit_index);

// what's assign do?
// index :: [ assigned, assigned, free, assigned, free ]
// now what?
// assignByte would pick index[2]
// but assign would fail if bytes was > 1
byte* assign(int bytes) { //You can optimise this
	do the same as assignbyte except check the next blocks as well:
	if this block and the next block for bytes 
}

// I don't get the purpose of the funcs, when do you call 'em?
//this function is useless
byte* assignByte() {
	for (int i = 0; i < SIZE; i++) {
		if (!getBit(index[i / 8], i % 8)) {
			setBit(index[i / 8], i % 8, true);
			return data + i;
		}
	}
	return nullptr;
}
```

I actually have a second way of doing this, but it's messier than a compression algo:

```pseudocode

```
> How hard is this, tell me it's not stupid complicated

the issue with an allocator is that you have to keep track of available blocks efficiently

here's the idea:
list available chunks in groups of {X}
when someone allocates {amt}:
	if it's more than {X}, allocate them ceil({amt} / {X})
	otherwise allocate them {amt}, split that listing of {X} into two, and mark one as allocated

> that already sounds complicated, and I doubt that you're even done

\- winter's pseudo code allocator

# NOTICEBOARD #