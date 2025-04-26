import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema({
    value: { required: true, type: String },
});

const Word = mongoose.model('Word', wordSchema);

export default Word;