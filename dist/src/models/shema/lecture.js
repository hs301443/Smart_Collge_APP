"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LectureModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LectureSchema = new mongoose_1.Schema({
    sub_name: {
        type: String,
        required: true,
        trim: true
    },
    level: { type: Number, enum: [1, 2, 3, 4, 5], },
    department: { type: String, enum: ["IT", "CS", "IS", "AI"], },
    icon: {
        type: String,
    },
    num_of_week: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    pdfs: [{
            name: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
            uploadDate: {
                type: Date,
                default: Date.now
            }
        }],
    video: {
        name: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        },
        duration: {
            type: Number, // مدة الفيديو بالثواني
            default: 0
        },
        quality: {
            type: String,
            enum: ['360p', '480p', '720p', '1080p', '4K'],
            default: '720p'
        },
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true // يضيف createdAt و updatedAt تلقائياً
});
exports.LectureModel = mongoose_1.default.model('Lecture', LectureSchema);
