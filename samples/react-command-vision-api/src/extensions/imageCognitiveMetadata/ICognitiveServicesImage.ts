export interface Category {
    name: string;
    score: number;
}

export interface Adult {
    isAdultContent: boolean;
    isRacyContent: boolean;
    adultScore: number;
    racyScore: number;
}

export interface Tag {
    name: string;
    confidence: number;
}

export interface Caption {
    text: string;
    confidence: number;
}

export interface Description {
    tags: string[];
    captions: Caption[];
}

export interface Metadata {
    width: number;
    height: number;
    format: string;
}

export interface FaceRectangle {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface Face {
    age: number;
    gender: string;
    faceRectangle: FaceRectangle;
}

export interface Color {
    dominantColorForeground: string;
    dominantColorBackground: string;
    dominantColors?: string[];
    accentColor: string;
    isBWImg?: boolean;
}

export interface ImageType {
    clipArtType: number;
    lineDrawingType: number;
}

export interface ICognitiveServicesImage {
    requestId: string;
    categories?: Category[];
    adult?: Adult;
    tags?: Tag[];
    description?: Description;    
    metadata?: Metadata;
    faces?: Face[];
    color?: Color;
    imageType?: ImageType;
}

