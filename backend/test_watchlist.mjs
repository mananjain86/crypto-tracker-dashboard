import mongoose from 'mongoose';
import User from './models/User.js';

async function test() {
  await mongoose.connect('mongodb+srv://24je0648:jmXgi9klUJkt1CEe@cluster0.eqig9tp.mongodb.net/test');
  let user = await User.findOne();
  if (!user) {
    user = new User({ email: 'test@example.com', password: 'abc', watchlist: [] });
    await user.save();
  }
  console.log("Found user:", user.email, user.watchlist);
  user.watchlist = user.watchlist || [];
  user.watchlist.push('bitcoin');
  try {
    await user.save();
    console.log("Saved successfully");
  } catch (err) {
    console.error("Save error:", err);
  }
  process.exit(0);
}
test();
