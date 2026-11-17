<?php

namespace App\Filament\Resources;

use App\Models\Product;
use App\Models\Category;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationIcon = 'heroicon-o-sparkles';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('General Information')->schema([
                Forms\Components\Select::make('category_id')
                    ->label('Maison Line / Category')
                    ->relationship('category', 'name_en')
                    ->searchable()
                    ->preload()
                    ->createOptionForm([
                        Forms\Components\TextInput::make('name_en')->required(),
                        Forms\Components\TextInput::make('name_ar')->required(),
                        Forms\Components\TextInput::make('slug')->required(),
                    ]),
                Forms\Components\Select::make('product_type')
                    ->options([
                        'perfume' => 'Haute Parfumerie (Extrait de Parfum)',
                        'skincare' => 'Soin & Skincare (Botanical Creams & Serums)',
                        'makeup' => 'Maquillage & Beauté',
                        'couture' => 'Haute Couture & Tailoring',
                        'accessory' => 'Objets & Fine Leather',
                    ])
                    ->default('perfume')
                    ->required()
                    ->reactive(),
                Forms\Components\TextInput::make('name_en')->label('Title (English)')->required(),
                Forms\Components\TextInput::make('name_ar')->label('Title (Arabic)')->required(),
                Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('tagline_en')->label('Tagline (English)'),
                Forms\Components\TextInput::make('tagline_ar')->label('Tagline (Arabic)'),
                Forms\Components\Textarea::make('story_en')->rows(3)->required(),
                Forms\Components\Textarea::make('story_ar')->rows(3)->required(),
            ])->columns(2),

            Forms\Components\Section::make('Fragrance Attributes (Only for Parfumerie)')
                ->schema([
                    Forms\Components\Select::make('family')
                        ->options([
                            'floral' => 'Floral Botanical',
                            'woody' => 'Smoky Woody',
                            'amber' => 'Amber Gourmand',
                            'oud' => 'Oud & Sacred Spice',
                        ]),
                    Forms\Components\TextInput::make('concentration')->default('Extrait de Parfum (32%)'),
                    Forms\Components\TagsInput::make('top_notes'),
                    Forms\Components\TagsInput::make('heart_notes'),
                    Forms\Components\TagsInput::make('base_notes'),
                ])
                ->visible(fn (Forms\Get $get) => $get('product_type') === 'perfume')
                ->columns(2),

            Forms\Components\Section::make('Skincare & Beauty Details')
                ->schema([
                    Forms\Components\Textarea::make('details_en')->label('Formula & Benefits (EN)'),
                    Forms\Components\Textarea::make('details_ar')->label('Formula & Benefits (AR)'),
                    Forms\Components\Textarea::make('ingredients_en')->label('Key Active Ingredients (EN)'),
                    Forms\Components\Textarea::make('ingredients_ar')->label('Key Active Ingredients (AR)'),
                    Forms\Components\Textarea::make('usage_en')->label('Application Ritual (EN)'),
                    Forms\Components\Textarea::make('usage_ar')->label('Application Ritual (AR)'),
                ])
                ->visible(fn (Forms\Get $get) => in_array($get('product_type'), ['skincare', 'makeup', 'couture', 'accessory']))
                ->columns(2),

            Forms\Components\Section::make('Variants & Pricing')->schema([
                Forms\Components\Repeater::make('variants')
                    ->relationship()
                    ->schema([
                        Forms\Components\TextInput::make('variant_name_en')->label('Size / Option (EN)')->placeholder('e.g. 50 ml Jar / 100 ml')->required(),
                        Forms\Components\TextInput::make('variant_name_ar')->label('Size / Option (AR)')->placeholder('e.g. ٥٠ مل'),
                        Forms\Components\TextInput::make('sku')->required(),
                        Forms\Components\TextInput::make('price')->numeric()->prefix('EGP')->required(),
                        Forms\Components\TextInput::make('compare_at_price')->numeric()->prefix('EGP'),
                        Forms\Components\TextInput::make('stock')->numeric()->default(20)->required(),
                        Forms\Components\Toggle::make('is_default')->default(false),
                    ])
                    ->columns(3),
            ]),

            Forms\Components\Section::make('Status & Visibility')->schema([
                Forms\Components\Toggle::make('is_active')->default(true),
                Forms\Components\Toggle::make('is_featured')->default(false),
                Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('name_en')->sortable()->searchable(),
            Tables\Columns\TextColumn::make('category.name_en')->label('Line')->sortable(),
            Tables\Columns\BadgeColumn::make('product_type')->colors([
                'primary' => 'perfume',
                'success' => 'skincare',
                'warning' => 'makeup',
                'info' => 'couture',
            ]),
            Tables\Columns\IconColumn::make('is_active')->boolean(),
            Tables\Columns\TextColumn::make('variants_count')->counts('variants')->label('Variants'),
            Tables\Columns\TextColumn::make('created_at')->dateTime(),
        ]);
    }
}
