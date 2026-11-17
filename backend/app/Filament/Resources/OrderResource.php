<?php

namespace App\Filament\Resources;

use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationGroup = 'Sales';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('number')->disabled(),
            Forms\Components\TextInput::make('name')->required(),
            Forms\Components\TextInput::make('phone')->required(),
            Forms\Components\TextInput::make('governorate')->required(),
            Forms\Components\Textarea::make('address')->required(),
            Forms\Components\Select::make('status')
                ->options([
                    'pending' => 'Pending',
                    'confirmed' => 'Confirmed & Wax Sealed',
                    'processing' => 'Processing',
                    'shipped' => 'Dispatched with Courier',
                    'delivered' => 'Delivered',
                    'cancelled' => 'Cancelled',
                ])->required(),
            Forms\Components\Select::make('payment_status')
                ->options([
                    'pending' => 'Pending',
                    'paid' => 'Paid',
                    'failed' => 'Failed',
                ])->required(),
            Forms\Components\TextInput::make('total')->numeric()->prefix('EGP')->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('number')->sortable()->searchable(),
            Tables\Columns\TextColumn::make('name')->searchable(),
            Tables\Columns\TextColumn::make('phone')->searchable(),
            Tables\Columns\TextColumn::make('governorate'),
            Tables\Columns\TextColumn::make('total')->money('EGP')->sortable(),
            Tables\Columns\BadgeColumn::make('status')->colors([
                'warning' => 'pending',
                'primary' => 'confirmed',
                'success' => 'delivered',
                'danger' => 'cancelled',
            ]),
            Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
        ]);
    }
}

